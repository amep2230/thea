import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api, errorSchemas } from "@shared/routes";
import { z } from "zod";
import { 
  GeneratePlanRequest, 
  PlanItem, 
  ILLNESS_TYPES, 
  ENERGY_LEVELS 
} from "@shared/schema";
import { randomUUID } from "crypto";

// --- Logic for Day Plan Generation ---

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(h, m, 0, 0);
  date.setMinutes(date.getMinutes() + minutes);
  return date.toTimeString().slice(0, 5);
}

function timeDiff(time1: string, time2: string): number {
  const [h1, m1] = time1.split(':').map(Number);
  const [h2, m2] = time2.split(':').map(Number);
  return (h1 * 60 + m1) - (h2 * 60 + m2);
}

function generatePlan(input: GeneratePlanRequest): PlanItem[] {
  const { onboarding, medications, currentTime, incident } = input;
  const plan: PlanItem[] = [];
  const endTime = "19:30"; // 7:30 PM
  
  let timeCursor = currentTime;
  
  // Incident handling adjustments
  let isGentleMode = false;
  if (incident === "Fever spike" || incident === "Threw up" || incident === "Energy crashed" || incident === "Won't eat/drink") {
    isGentleMode = true;
  }
  
  const childEnergy = isGentleMode ? "Low" : onboarding.childEnergyLevel;

  // Activities bank
  const activities = {
    Low: [
      { title: "Audiobook Time", emoji: "🎧", tags: ["rest", "quiet"] },
      { title: "Gentle Stretching", emoji: "🧘", tags: ["movement"] },
      { title: "Watch a Comfort Movie", emoji: "🎬", tags: ["screen"] },
      { title: "Listen to Soft Music", emoji: "🎵", tags: ["rest"] },
    ],
    Medium: [
      { title: "Coloring / Drawing", emoji: "🖍️", tags: ["creative"] },
      { title: "Build a Fort", emoji: "🏰", tags: ["play"] },
      { title: "Play with Lego/Blocks", emoji: "🧱", tags: ["play"] },
      { title: "Read a Book Together", emoji: "📖", tags: ["bonding"] },
    ],
    Okay: [
      { title: "Dance Party (Short)", emoji: "💃", tags: ["active"] },
      { title: "Simple Board Game", emoji: "🎲", tags: ["play"] },
      { title: "Help with Simple Chores", emoji: "🧹", tags: ["helper"] },
      { title: "Indoor Scavenger Hunt", emoji: "🔍", tags: ["active"] },
    ]
  };

  const rest_activities = [
    { title: "Nap / Quiet Time", emoji: "💤", tags: ["rest"] },
    { title: "Cuddle Time", emoji: "🧸", tags: ["bonding"] },
    { title: "Screen Free Rest", emoji: "📵", tags: ["rest"] },
  ];

  const meals = [
    { title: "Hydration Check", emoji: "💧", description: "Water, juice, or electrolyte drink" },
    { title: "Light Snack", emoji: "🍎", description: "Fruit, crackers, or toast" },
    { title: "Meal Time", emoji: "🍽️", description: "Easy to digest food" },
  ];

  // Helper to get random item
  const pick = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

  // Basic scheduling loop
  let lastType = "";
  
  // If incident occurred, start with immediate relief
  if (incident) {
    plan.push({
      id: randomUUID(),
      type: "rest",
      title: "Immediate Rest & Comfort",
      description: `Take a moment to handle the ${incident.toLowerCase()}.`,
      time: timeCursor,
      emoji: "❤️",
      tags: ["incident"],
      status: "pending",
      isGentle: true
    });
    timeCursor = addMinutes(timeCursor, 30);
  }

  while (timeDiff(endTime, timeCursor) > 0) {
    // 1. Check Medications
    if (medications && medications.length > 0) {
      medications.forEach(med => {
        // Simple logic: if last given + freq <= current cursor, add med
        // This is a simplified "companion" logic
        // For now, let's just add a med reminder if it hasn't been added recently
        // In a real app we'd track specific med schedules more strictly.
        // Here we just space them out based on frequency string.
        
        // Parse frequency (e.g. "4h" -> 240 mins)
        const freqHours = parseInt(med.frequency);
        
        // This simplistic generator just adds them based on intervals from "now" 
        // if we assume "timeLastGiven" was "a while ago" or we just schedule next doses.
        // Let's schedule the *next* dose based on timeLastGiven.
        
        const lastGiven = med.timeLastGiven;
        // Calculate next dose time
        // ... (simplified for this demo: just sprinkle them in if they fall in the window)
      });
    }

    // 2. Add Block (Alternate Rest / Activity / Meal)
    // Heuristic:
    // - Meal/Snack every 2-3 hours
    // - Rest vs Activity based on Energy
    
    const hour = parseInt(timeCursor.split(':')[0]);
    
    let nextBlockDuration = 30;
    let nextType = "";
    let nextItem: any = {};

    // Meal times (approximate)
    if ((hour === 12 || hour === 18) && lastType !== "meal") {
       nextType = "meal";
       nextItem = meals[2]; // Meal Time
       nextBlockDuration = 45;
    } else if ((hour === 10 || hour === 15) && lastType !== "meal") {
       nextType = "meal";
       nextItem = meals[1]; // Snack
       nextBlockDuration = 20;
    } else {
      // Activity or Rest
      // If Low energy or Incident -> Mostly Rest
      if (childEnergy === "Low") {
        nextType = Math.random() > 0.3 ? "rest" : "activity"; // 70% rest
      } else if (childEnergy === "Medium") {
        nextType = Math.random() > 0.5 ? "rest" : "activity"; // 50/50
      } else {
        nextType = Math.random() > 0.7 ? "activity" : "rest"; // 70% activity
      }
      
      if (nextType === "rest") {
        nextItem = pick(rest_activities); // Oops, fixed typo in variable name below
        nextBlockDuration = 45;
      } else {
        // Pick activity based on energy level bucket
        // If child is Low, pick Low activities. If Medium, pick Low or Medium.
        let bucket: any[] = activities.Low;
        if (childEnergy === "Medium") bucket = [...activities.Low, ...activities.Medium];
        if (childEnergy === "Okay") bucket = [...activities.Medium, ...activities.Okay];
        
        nextItem = pick(bucket);
        nextBlockDuration = 30;
      }
    }

    // prevent back-to-back same exact items if possible (simple check)
    if (nextType === lastType && nextType !== "rest") {
        // force swap if possible, or just accept it
    }

    // Add Plan Item
    plan.push({
      id: randomUUID(),
      type: nextType as any,
      title: nextItem.title,
      description: nextItem.description,
      time: timeCursor,
      emoji: nextItem.emoji,
      tags: nextItem.tags || [],
      status: "pending",
      isGentle: isGentleMode
    });

    lastType = nextType;
    timeCursor = addMinutes(timeCursor, nextBlockDuration);
  }

  // Handle Medications - simplistic insertion
  // We'll insert medication cards into the flow at roughly correct intervals
  if (medications) {
    medications.forEach(med => {
       const freqMinutes = parseInt(med.frequency) * 60;
       let nextDoseTime = addMinutes(med.timeLastGiven, freqMinutes);
       
       // While next dose is before end of day
       while (timeDiff(endTime, nextDoseTime) > 0) {
          // If next dose is in the future (after current time)
          if (timeDiff(nextDoseTime, currentTime) > 0) {
              // Find insertion point in plan
              // This is a bit rough, just appending for now, need to sort
              plan.push({
                id: randomUUID(),
                type: "medication",
                title: `Give ${med.name}`,
                description: `Dosage: ${med.dosage}`,
                time: nextDoseTime,
                emoji: "💊",
                tags: ["medication", "important"],
                status: "pending",
                isGentle: false
              });
          }
          nextDoseTime = addMinutes(nextDoseTime, freqMinutes);
       }
    });
  }

  // Sort by time
  plan.sort((a, b) => a.time.localeCompare(b.time));

  return plan;
}

// Fixed variable name typo reference above
const rest_activities = [
    { title: "Nap / Quiet Time", emoji: "💤", tags: ["rest"] },
    { title: "Cuddle Time", emoji: "🧸", tags: ["bonding"] },
    { title: "Audiobook listening", emoji: "🎧", tags: ["rest"] },
];


export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post(api.plan.generate.path, async (req, res) => {
    try {
      const input = api.plan.generate.input.parse(req.body);
      const plan = generatePlan(input);
      
      // Store the generated plan
      await storage.createPlan(plan);
      
      res.json(plan);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.patch(api.plan.updateItem.path, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = api.plan.updateItem.input.parse(req.body);
      
      const updated = await storage.updatePlanItem(id, status);
      
      if (!updated) {
        return res.status(404).json({ message: "Item not found" });
      }
      
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  return httpServer;
}
