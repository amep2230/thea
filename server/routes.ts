/**
 * @deprecated This file is no longer used. All data operations have been migrated to Convex.
 * The plan generation logic has been moved to convex/actions.ts
 * API routes are no longer needed as the frontend uses Convex hooks directly.
 */

// import type { Express } from "express";
// import type { Server } from "http";
// import { storage } from "./storage";
// import { api, errorSchemas } from "@shared/routes";
// import { z } from "zod";
// import { 
//   GeneratePlanRequest, 
//   PlanItem, 
//   ILLNESS_TYPES, 
//   ENERGY_LEVELS,
//   INCIDENT_TYPES,
//   IncidentType,
// } from "@shared/schema";
// import { randomUUID } from "crypto";

const INCIDENT_PATTERNS: { incident: IncidentType; keywords: string[] }[] = [
  {
    incident: "Fever spike",
    keywords: ["fever", "temperature", "hot", "burning up", "thermometer", "degrees", "temp spike", "high temp"],
  },
  {
    incident: "Threw up",
    keywords: ["threw up", "vomit", "vomiting", "throw up", "throwing up", "puked", "puke", "sick to stomach", "nauseous", "nausea"],
  },
  {
    incident: "Energy crashed",
    keywords: ["tired", "exhausted", "no energy", "energy crashed", "crash", "lethargic", "sleepy", "can't move", "wiped out", "sluggish", "drained"],
  },
  {
    incident: "Feeling better",
    keywords: ["feeling better", "better now", "improved", "getting better", "perked up", "more energy", "seems good", "doing well", "bouncing back", "recovering"],
  },
  {
    incident: "Won't eat/drink",
    keywords: ["won't eat", "won't drink", "not eating", "not drinking", "refuses food", "refuses water", "no appetite", "can't eat", "doesn't want food"],
  },
];

function detectIncidentFromText(text: string): IncidentType | null {
  const lower = text.toLowerCase();
  let bestMatch: { incident: IncidentType; score: number } | null = null;

  for (const pattern of INCIDENT_PATTERNS) {
    let score = 0;
    for (const keyword of pattern.keywords) {
      if (lower.includes(keyword)) {
        score += keyword.split(" ").length;
      }
    }
    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { incident: pattern.incident, score };
    }
  }

  return bestMatch?.incident ?? null;
}

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

function generatePlanLocal(input: GeneratePlanRequest): PlanItem[] {
  const { onboarding, medications, currentTime, incident, incidentDescription } = input;
  const plan: PlanItem[] = [];
  
  const currentHour = parseInt(currentTime.split(':')[0]);
  const endTime = currentHour >= 19 ? "23:00" : "19:30";
  
  let timeCursor = currentTime;
  
  let isGentleMode = false;
  if (incident === "Fever spike" || incident === "Threw up" || incident === "Energy crashed" || incident === "Won't eat/drink") {
    isGentleMode = true;
  }
  if (!incident && incidentDescription) {
    const detected = detectIncidentFromText(incidentDescription);
    if (detected && detected !== "Feeling better") {
      isGentleMode = true;
    }
  }
  
  const childEnergy = isGentleMode ? "Low" : onboarding.childEnergyLevel;

  const activities = {
    Low: [
      { title: "Audiobook Time", emoji: "rest", tags: ["rest", "quiet"] },
      { title: "Gentle Stretching", emoji: "movement", tags: ["movement"] },
      { title: "Watch a Comfort Movie", emoji: "screen", tags: ["screen"] },
      { title: "Listen to Soft Music", emoji: "rest", tags: ["rest"] },
    ],
    Medium: [
      { title: "Coloring / Drawing", emoji: "creative", tags: ["creative"] },
      { title: "Build a Fort", emoji: "play", tags: ["play"] },
      { title: "Play with Lego/Blocks", emoji: "play", tags: ["play"] },
      { title: "Read a Book Together", emoji: "bonding", tags: ["bonding"] },
    ],
    Okay: [
      { title: "Dance Party (Short)", emoji: "active", tags: ["active"] },
      { title: "Simple Board Game", emoji: "play", tags: ["play"] },
      { title: "Help with Simple Chores", emoji: "helper", tags: ["helper"] },
      { title: "Indoor Scavenger Hunt", emoji: "active", tags: ["active"] },
    ]
  };

  const rest_activities = [
    { title: "Nap / Quiet Time", emoji: "rest", tags: ["rest"] },
    { title: "Cuddle Time", emoji: "bonding", tags: ["bonding"] },
    { title: "Screen Free Rest", emoji: "rest", tags: ["rest"] },
  ];

  const meals = [
    { title: "Hydration Check", emoji: "hydration", description: "Water, juice, or electrolyte drink" },
    { title: "Light Snack", emoji: "snack", description: "Fruit, crackers, or toast" },
    { title: "Meal Time", emoji: "meal", description: "Easy to digest food" },
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
      emoji: "care",
      tags: ["incident"],
      status: "pending",
      isGentle: true
    });
    timeCursor = addMinutes(timeCursor, 30);
  }

  while (timeDiff(endTime, timeCursor) > 0) {
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
                emoji: "medication",
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

async function modifyPlanWithAI(input: GeneratePlanRequest): Promise<PlanItem[]> {
  const { onboarding, medications, currentTime, incident, incidentDescription, existingPlan } = input;

  const apiKey = process.env.MINIMAX_API_KEY;
  if (!apiKey) {
    console.warn("MINIMAX_API_KEY not set, falling back to local plan generation");
    return generatePlanLocal(input);
  }

  const currentHour = parseInt(currentTime.split(':')[0]);
  const endTime = currentHour >= 19 ? "23:00" : "19:30";

  const existingPlanSummary = existingPlan
    ?.filter(item => item.status === "pending")
    .map(item => `${item.time} - [${item.type}] ${item.title}${item.description ? `: ${item.description}` : ''}`)
    .join('\n') || "No existing plan items.";

  const medicationSummary = medications?.length
    ? medications.map(m => `${m.name} (${m.dosage}, every ${m.frequency})`).join(', ')
    : "None";

  const systemPrompt = `You are Thea, a caring AI assistant helping parents manage their child's sick day. You modify care plans when incidents happen during the day.

RULES:
- Output ONLY a valid JSON array of plan items, no other text
- Each item must have: type ("activity"|"medication"|"meal"|"rest"), title (string), description (string), time (HH:mm 24h format), tags (string array), isGentle (boolean)
- Generate items from ${currentTime} until ${endTime}
- Time blocks should be 20-45 minutes apart
- Keep any existing medication schedules
- Be age-appropriate for a ${onboarding.childAge}-year-old
- Adapt the plan based on the incident that occurred
- Activities should be realistic indoor sick-day activities
- Include hydration checks every 1-2 hours
- Balance rest with gentle activities based on energy level`;

  const userPrompt = `CHILD: ${onboarding.childName}, age ${onboarding.childAge}
ILLNESS: ${onboarding.illnessTypes.join(', ')}
CHILD ENERGY: ${onboarding.childEnergyLevel}
PARENT ENERGY: ${onboarding.parentEnergyLevel}
MEDICATIONS: ${medicationSummary}
CURRENT TIME: ${currentTime}

${incident ? `INCIDENT TYPE: ${incident}` : 'INCIDENT TYPE: Not specified (infer from description below)'}
${incidentDescription ? `PARENT'S DESCRIPTION: "${incidentDescription}"` : ''}

CURRENT PLAN (pending items):
${existingPlanSummary}

Based on this update from the parent, generate an updated care plan for the rest of the day. Use the parent's description to understand what happened and adjust activities accordingly. If the child's condition worsened, make the plan gentler with more rest. If they're feeling better, allow slightly more active things. Even if no specific incident category was selected, use the description to guide your plan adjustments.

Respond with ONLY a JSON array like:
[{"type":"rest","title":"...","description":"...","time":"HH:mm","tags":["..."],"isGentle":true}]`;

  try {
    const response = await fetch("https://api.minimax.io/v1/text/chatcompletion_v2", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "MiniMax-M1",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("MiniMax API error:", response.status, errorText);
      return generatePlanLocal(input);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error("MiniMax returned empty content");
      return generatePlanLocal(input);
    }

    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error("Could not parse JSON array from MiniMax response:", content.substring(0, 200));
      return generatePlanLocal(input);
    }

    const rawItems = JSON.parse(jsonMatch[0]);

    const plan: PlanItem[] = rawItems.map((item: any) => ({
      id: randomUUID(),
      type: ["activity", "medication", "meal", "rest"].includes(item.type) ? item.type : "activity",
      title: String(item.title || "Activity"),
      description: String(item.description || ""),
      time: String(item.time || currentTime),
      emoji: item.type || "activity",
      tags: Array.isArray(item.tags) ? item.tags.map(String) : [],
      status: "pending" as const,
      isGentle: Boolean(item.isGentle),
    }));

    plan.sort((a, b) => a.time.localeCompare(b.time));

    if (plan.length === 0) {
      console.warn("MiniMax returned 0 items, falling back to local generation");
      return generatePlanLocal(input);
    }

    return plan;
  } catch (error) {
    console.error("MiniMax API call failed:", error);
    return generatePlanLocal(input);
  }
}


// All API routes have been migrated to Convex - this function is no longer called
/*
export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post(api.plan.generate.path, async (req, res) => {
    try {
      const input = api.plan.generate.input.parse(req.body);
      
      let plan: PlanItem[];
      
      const hasIncident = !!input.incident;
      const hasDescription = !!input.incidentDescription?.trim();
      
      if (hasIncident || hasDescription) {
        if (!input.incident && hasDescription) {
          const detected = detectIncidentFromText(input.incidentDescription!);
          if (detected) {
            input.incident = detected;
          }
        }
        plan = await modifyPlanWithAI(input);
      } else {
        plan = generatePlanLocal(input);
      }
      
      await storage.createPlan(plan);
      
      res.json(plan);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      console.error("Plan generation error:", err);
      return res.status(500).json({ message: "Failed to generate plan" });
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
*/
