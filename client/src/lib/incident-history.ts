import type { PlanItem, IncidentType, OnboardingData, MedicationData } from "@shared/schema";

export interface IncidentRecord {
  timestamp: string;
  category?: IncidentType;
  description?: string;
}

export interface SickDay {
  date: string;
  onboarding: OnboardingData;
  medications: MedicationData[];
  plan: PlanItem[];
  incidents: IncidentRecord[];
}

const STORAGE_KEY = "thea_sick_days";

function todayKey(): string {
  return new Date().toISOString().split("T")[0];
}

export function getSickDays(): SickDay[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSickDays(days: SickDay[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(days));
}

export function getOrCreateToday(onboarding: OnboardingData, medications: MedicationData[]): SickDay {
  const days = getSickDays();
  const key = todayKey();
  let today = days.find(d => d.date === key);
  if (!today) {
    today = { date: key, onboarding, medications, plan: [], incidents: [] };
    days.push(today);
    saveSickDays(days);
  }
  return today;
}

export function savePlanForToday(plan: PlanItem[]) {
  const days = getSickDays();
  const key = todayKey();
  const idx = days.findIndex(d => d.date === key);
  if (idx >= 0) {
    days[idx].plan = plan;
    saveSickDays(days);
  }
}

export function addIncidentToday(category?: IncidentType, description?: string) {
  const days = getSickDays();
  const key = todayKey();
  const idx = days.findIndex(d => d.date === key);
  if (idx >= 0) {
    days[idx].incidents.push({
      timestamp: new Date().toISOString(),
      category,
      description,
    });
    saveSickDays(days);
  }
}
