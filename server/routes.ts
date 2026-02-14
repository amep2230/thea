import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api, errorSchemas } from "@shared/routes";
import { z } from "zod";
import { 
  GeneratePlanRequest, 
  PlanItem, 
  ILLNESS_TYPES, 
  ENERGY_LEVELS,
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
  
  const currentHour = parseInt(currentTime.split(':')[0]);
  const endTime = currentHour >= 19 ? "23:00" : "19:30";
  
  let timeCursor = currentTime;
  
  let isGentleMode = false;
  if (incident === "Fever spike" || incident === "Threw up" || incident === "Energy crashed" || incident === "Won't eat/drink") {
    isGentleMode = true;
  }
  
  const childEnergy = isGentleMode ? "Low" : onboarding.childEnergyLevel;

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

  const pick = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

  let lastType = "";
  
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
    if (medications && medications.length > 0) {
      medications.forEach(med => {
        const freqHours = parseInt(med.frequency);
        const lastGiven = med.timeLastGiven;
      });
    }

    const hour = parseInt(timeCursor.split(':')[0]);
    
    let nextBlockDuration = 30;
    let nextType = "";
    let nextItem: any = {};

    if ((hour === 12 || hour === 18) && lastType !== "meal") {
       nextType = "meal";
       nextItem = meals[2];
       nextBlockDuration = 45;
    } else if ((hour === 10 || hour === 15) && lastType !== "meal") {
       nextType = "meal";
       nextItem = meals[1];
       nextBlockDuration = 20;
    } else {
      if (childEnergy === "Low") {
        nextType = Math.random() > 0.3 ? "rest" : "activity";
      } else if (childEnergy === "Medium") {
        nextType = Math.random() > 0.5 ? "rest" : "activity";
      } else {
        nextType = Math.random() > 0.7 ? "activity" : "rest";
      }
      
      if (nextType === "rest") {
        nextItem = pick(rest_activities);
        nextBlockDuration = 45;
      } else {
        let bucket: any[] = activities.Low;
        if (childEnergy === "Medium") bucket = [...activities.Low, ...activities.Medium];
        if (childEnergy === "Okay") bucket = [...activities.Medium, ...activities.Okay];
        
        nextItem = pick(bucket);
        nextBlockDuration = 30;
      }
    }

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

  if (medications) {
    medications.forEach(med => {
       const freqMinutes = parseInt(med.frequency) * 60;
       let nextDoseTime = addMinutes(med.timeLastGiven, freqMinutes);
       
       while (timeDiff(endTime, nextDoseTime) > 0) {
          if (timeDiff(nextDoseTime, currentTime) > 0) {
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

  plan.sort((a, b) => a.time.localeCompare(b.time));

  return plan;
}


export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post(api.plan.generate.path, async (req, res) => {
    try {
      const input = api.plan.generate.input.parse(req.body);
      const plan = generatePlan(input);
      
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
