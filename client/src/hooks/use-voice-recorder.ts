import { useState, useRef, useCallback } from "react";
import type { IncidentType, VoiceTranscriptionResponse } from "@shared/schema";

type VoiceRecorderState = "idle" | "recording" | "processing" | "done" | "error";

export function useVoiceRecorder() {
  const [state, setState] = useState<VoiceRecorderState>("idle");
  const [result, setResult] = useState<VoiceTranscriptionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setResult(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());

        const audioBlob = new Blob(chunksRef.current, { type: mimeType });
        
        if (audioBlob.size === 0) {
          setState("error");
          setError("No audio was recorded. Please try again.");
          return;
        }

        setState("processing");

        try {
          const formData = new FormData();
          const ext = mimeType.includes('webm') ? 'webm' : 'mp4';
          formData.append('audio', audioBlob, `recording.${ext}`);

          const response = await fetch('/api/voice/transcribe', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            const errData = await response.json().catch(() => ({ message: 'Transcription failed' }));
            throw new Error(errData.message || 'Transcription failed');
          }

          const data: VoiceTranscriptionResponse = await response.json();
          setResult(data);
          setState("done");
        } catch (err: any) {
          setError(err.message || "Failed to process audio");
          setState("error");
        }
      };

      mediaRecorder.onerror = () => {
        setState("error");
        setError("Recording failed. Please try again.");
      };

      mediaRecorder.start(250);
      setState("recording");
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setError("Microphone access denied. Please allow microphone permissions.");
      } else if (err.name === 'NotFoundError') {
        setError("No microphone found. Please connect a microphone.");
      } else {
        setError(err.message || "Could not start recording");
      }
      setState("error");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const reset = useCallback(() => {
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
