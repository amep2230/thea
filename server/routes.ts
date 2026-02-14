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
  INCIDENT_TYPES,
  type IncidentType,
  type VoiceTranscriptionResponse
} from "@shared/schema";
import { randomUUID } from "crypto";
import multer from "multer";
import FormData from "form-data";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

function detectIncidentFromText(text: string): { incident: IncidentType | null; confidence: number } {
  const lower = text.toLowerCase();

  const patterns: { incident: IncidentType; keywords: string[]; weight: number }[] = [
    { 
      incident: "Fever spike", 
      keywords: ["fever", "temperature", "hot", "burning up", "thermometer", "degrees", "temp spike", "high temp", "fever spike"],
      weight: 1 
    },
    { 
      incident: "Threw up", 
      keywords: ["threw up", "vomit", "vomiting", "throw up", "throwing up", "puked", "puke", "sick to stomach", "nauseous", "nausea"],
      weight: 1 
    },
    { 
      incident: "Energy crashed", 
      keywords: ["tired", "exhausted", "no energy", "energy crashed", "crash", "lethargic", "sleepy", "can't move", "wiped out", "zonked", "sluggish", "drained"],
      weight: 1 
    },
    { 
      incident: "Feeling better", 
      keywords: ["feeling better", "better now", "improved", "getting better", "perked up", "more energy", "seems good", "doing well", "bouncing back", "recovering"],
      weight: 1 
    },
    { 
      incident: "Won't eat/drink", 
      keywords: ["won't eat", "won't drink", "not eating", "not drinking", "refuses food", "refuses water", "no appetite", "can't eat", "doesn't want food", "won't take anything"],
      weight: 1 
    },
  ];

  let bestMatch: { incident: IncidentType; score: number } | null = null;

  for (const pattern of patterns) {
    let score = 0;
    for (const keyword of pattern.keywords) {
      if (lower.includes(keyword)) {
        score += keyword.split(' ').length;
      }
    }
    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { incident: pattern.incident, score };
    }
  }

  if (bestMatch) {
    const confidence = Math.min(bestMatch.score / 3, 1);
    return { incident: bestMatch.incident, confidence };
  }

  return { incident: null, confidence: 0 };
}

async function transcribeWithMinimax(audioBuffer: Buffer, mimeType: string): Promise<string> {
  const apiKey = process.env.MINIMAX_API_KEY;
  const groupId = process.env.MINIMAX_GROUP_ID;

  if (!apiKey || !groupId) {
    throw new Error("MINIMAX_API_KEY and MINIMAX_GROUP_ID must be configured");
  }

  const formData = new FormData();
  
  const ext = mimeType.includes('wav') ? 'wav' : 
              mimeType.includes('mp3') ? 'mp3' : 
              mimeType.includes('ogg') ? 'ogg' :
              mimeType.includes('webm') ? 'webm' : 'wav';
  
  formData.append('file', audioBuffer, {
    filename: `recording.${ext}`,
    contentType: mimeType,
  });

  const response = await fetch(
    `https://api.minimax.chat/v1/audio/asr?GroupId=${groupId}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        ...formData.getHeaders(),
      },
      body: formData as any,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("MiniMax ASR error:", response.status, errorText);
    throw new Error(`MiniMax API error: ${response.status}`);
  }

  const result = await response.json() as any;
  
  if (result.base_resp && result.base_resp.status_code !== 0) {
    throw new Error(`MiniMax API error: ${result.base_resp.status_msg || 'Unknown error'}`);
  }
  
  return result.text || result.result?.text || "";
}

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
  const endTime = "19:30";
  
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

  app.post(api.voice.transcribe.path, upload.single('audio'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No audio file provided" });
      }

      const mimeType = req.file.mimetype || 'audio/webm';
      
      let transcription: string;
      try {
        transcription = await transcribeWithMinimax(req.file.buffer, mimeType);
      } catch (err: any) {
        console.error("Transcription error:", err.message);
        return res.status(500).json({ message: `Transcription failed: ${err.message}` });
      }

      const { incident, confidence } = detectIncidentFromText(transcription);

      const response: VoiceTranscriptionResponse = {
        transcription,
        detectedIncident: incident,
        confidence,
      };

      res.json(response);
    } catch (err: any) {
      console.error("Voice transcribe error:", err);
      res.status(500).json({ message: err.message || "Internal server error" });
    }
  });

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
