import { useEffect, useRef, useCallback, useState } from "react";
import type { PlanItem } from "@shared/schema";

type NotificationPermissionState = "default" | "granted" | "denied";

function playAlertSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

    const playTone = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
      gain.gain.setValueAtTime(0.3, startTime + duration - 0.1);
      gain.gain.linearRampToValueAtTime(0, startTime + duration);

      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    playTone(880, now, 0.2);
    playTone(1100, now + 0.25, 0.2);
    playTone(880, now + 0.5, 0.2);
    playTone(1100, now + 0.75, 0.2);
    playTone(1320, now + 1.0, 0.4);

    setTimeout(() => ctx.close(), 3000);
  } catch {
    // Audio not available
  }
}

function showNotification(item: PlanItem) {
  const title = `Medication Reminder: ${item.title}`;
  const options: NotificationOptions = {
    body: item.description || "Time to give the next dose.",
    icon: "/favicon.ico",
    tag: `med-${item.id}`,
    requireInteraction: true,
    silent: false,
  };

  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: "SHOW_NOTIFICATION",
      title,
      options,
    });
  } else {
    new Notification(title, options);
  }

  playAlertSound();
}

export function useMedicationNotifications(plan: PlanItem[] | null) {
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const firedRef = useRef<Set<string>>(new Set());
  const [permission, setPermission] = useState<NotificationPermissionState>(
    typeof Notification !== "undefined" ? Notification.permission : "default"
  );

  const requestPermission = useCallback(async () => {
    if (typeof Notification === "undefined") return "denied" as const;
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  useEffect(() => {
    if (typeof Notification !== "undefined") {
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    if (!plan || permission !== "granted") return;

    const medItems = plan.filter(
      (item) => item.type === "medication" && item.status === "pending"
    );

    const now = new Date();

    medItems.forEach((item) => {
      if (firedRef.current.has(item.id)) return;

      const [h, m] = item.time.split(":").map(Number);
      const itemDate = new Date();
      itemDate.setHours(h, m, 0, 0);

      const msUntil = itemDate.getTime() - now.getTime();

      if (msUntil < -60000) return;

      if (msUntil <= 0) {
        firedRef.current.add(item.id);
        showNotification(item);
        return;
      }

      const timer = setTimeout(() => {
        if (firedRef.current.has(item.id)) return;
        firedRef.current.add(item.id);
        showNotification(item);
      }, msUntil);

      timersRef.current.push(timer);
    });

    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [plan, permission]);

  const clearFired = useCallback(() => {
    firedRef.current.clear();
  }, []);

  return { permission, requestPermission, clearFired };
}
