import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Since we are using in-memory storage as requested, we will primarily use Zod schemas
// for validation and type inference, but we'll keep the Drizzle table definitions
// in case we want to upgrade to a real DB later.

export const ILLNESS_TYPES = ["Cold", "Flu", "Stomach Bug", "Fever", "Cough", "Ear Infection"] as const;
export const ENERGY_LEVELS = ["Low", "Medium", "High"] as const; // Child has Low/Medium/Okay(High-ish), Parent has Low/Medium/High
export const MEDICATION_FREQUENCIES = ["4h", "6h", "8h", "12h"] as const;

// schema for onboarding data
export const onboardingSchema = z.object({
  childName: z.string().min(1, "Child's name is required"),
  childAge: z.number().min(1).max(8),
  illnessTypes: z.array(z.enum(ILLNESS_TYPES)).min(1, "Select at least one illness"),
  childEnergyLevel: z.enum(["Low", "Medium", "Okay"]),
  parentEnergyLevel: z.enum(["Low", "Medium", "High"]),
});

export const medicationSchema = z.object({
  name: z.string().min(1, "Medication name is required"),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.enum(MEDICATION_FREQUENCIES),
  timeLastGiven: z.string(), // ISO string or HH:mm
});

export const planItemSchema = z.object({
  id: z.string(),
  type: z.enum(["activity", "medication", "meal", "rest"]),
  title: z.string(),
  description: z.string().optional(),
  time: z.string(), // HH:mm
  emoji: z.string(),
  tags: z.array(z.string()),
  status: z.enum(["pending", "completed", "skipped"]).default("pending"),
  isGentle: z.boolean().default(false), // for "gentler activities"
});

export const appStateSchema = z.object({
  onboarding: onboardingSchema,
  medications: z.array(medicationSchema).optional(),
  dayPlan: z.array(planItemSchema),
  lastUpdated: z.string(), // timestamp
});

export type OnboardingData = z.infer<typeof onboardingSchema>;
export type MedicationData = z.infer<typeof medicationSchema>;
export type PlanItem = z.infer<typeof planItemSchema>;
export type AppState = z.infer<typeof appStateSchema>;

// Request types
export type GeneratePlanRequest = {
  onboarding: OnboardingData;
  medications?: MedicationData[];
  currentTime: string; // HH:mm
  incident?: "Fever spike" | "Threw up" | "Energy crashed" | "Feeling better" | "Won't eat/drink";
};

export type UpdatePlanItemRequest = {
  status: "completed" | "skipped";
};

// Response types
export type PlanResponse = PlanItem[];
