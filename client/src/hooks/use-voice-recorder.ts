import { useState, useRef, useCallback } from "react";
import type { IncidentType, VoiceTranscriptionResponse } from "@shared/schema";
import { INCIDENT_TYPES } from "@shared/schema";

type VoiceRecorderState = "idle" | "recording" | "processing" | "done" | "error";

const INCIDENT_PATTERNS: { incident: IncidentType; keywords: string[] }[] = [
  {
    incident: "Fever spike",
    keywords: ["fever", "temperature", "hot", "burning up", "thermometer", "degrees", "temp spike", "high temp", "fever spike"],
  },
  {
    incident: "Threw up",
    keywords: ["threw up", "vomit", "vomiting", "throw up", "throwing up", "puked", "puke", "sick to stomach", "nauseous", "nausea"],
  },
  {
    incident: "Energy crashed",
    keywords: ["tired", "exhausted", "no energy", "energy crashed", "crash", "lethargic", "sleepy", "can't move", "wiped out", "zonked", "sluggish", "drained"],
  },
  {
    incident: "Feeling better",
    keywords: ["feeling better", "better now", "improved", "getting better", "perked up", "more energy", "seems good", "doing well", "bouncing back", "recovering"],
  },
  {
    incident: "Won't eat/drink",
    keywords: ["won't eat", "won't drink", "not eating", "not drinking", "refuses food", "refuses water", "no appetite", "can't eat", "doesn't want food", "won't take anything"],
  },
];

function detectIncidentFromText(text: string): { incident: IncidentType | null; confidence: number } {
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

  if (bestMatch) {
    const confidence = Math.min(bestMatch.score / 3, 1);
    return { incident: bestMatch.incident, confidence };
  }

  return { incident: null, confidence: 0 };
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

export function useVoiceRecorder() {
  const [state, setState] = useState<VoiceRecorderState>("idle");
  const [result, setResult] = useState<VoiceTranscriptionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setResult(null);

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setError("Voice recognition is not supported in this browser. Please use Chrome or Edge.");
        setState("error");
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";
      recognition.maxAlternatives = 1;

      recognitionRef.current = recognition;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0]?.[0]?.transcript || "";

        if (!transcript.trim()) {
          setState("error");
          setError("Could not understand the audio. Please try again.");
          return;
        }

        setState("processing");

        const { incident, confidence } = detectIncidentFromText(transcript);

        const response: VoiceTranscriptionResponse = {
          transcription: transcript,
          detectedIncident: incident,
          confidence,
        };

        setResult(response);
        setState("done");
      };

      recognition.onerror = (event: any) => {
        const errorType = event.error;
        if (errorType === "not-allowed") {
          setError("Microphone access denied. Please allow microphone permissions.");
        } else if (errorType === "no-speech") {
          setError("No speech detected. Please try again.");
        } else if (errorType === "network") {
          setError("Network error during speech recognition. Please check your connection.");
        } else if (errorType === "aborted") {
          return;
        } else {
          setError("Voice recognition failed. Please try again or type your description.");
        }
        setState("error");
      };

      recognition.onend = () => {
        if (state === "recording") {
          setState("idle");
        }
      };

      recognition.start();
      setState("recording");
    } catch (err: any) {
      setError(err.message || "Could not start voice recognition");
      setState("error");
    }
  }, [state]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const reset = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
    }
    setState("idle");
    setResult(null);
    setError(null);
  }, []);

  return {
    state,
    result,
    error,
    startRecording,
    stopRecording,
    reset,
  };
}
