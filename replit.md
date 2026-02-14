# Thea — Sick Day Companion for Parents

## Overview
Mobile-first web app helping parents manage their child's sick days. Guides them through onboarding, optional medication setup, and generates a personalized day plan with time-blocked activities, meals, rest, and medication reminders.

## Architecture
- **Frontend**: React + Vite, wouter routing, TanStack Query, Tailwind CSS, shadcn/ui
- **Backend**: Express.js (Node), in-memory storage (no database needed for core features)
- **Shared**: Zod schemas in `shared/schema.ts` and API contract in `shared/routes.ts`

## Screens
1. **Onboarding** (`/`) - Collects child info, illness types, energy levels
2. **Medication Setup** (`/medications`) - Optional medication entry with skip
3. **Day Plan** (`/plan`) - Generated timeline of activities, meals, rest, meds

## Key Features
- Day plan generation based on child energy level and illness
- Incident reporting ("Something changed" FAB) with plan regeneration
- **Voice-to-Action**: Uses browser Web Speech API for voice recognition, auto-detects incident type with sparkle animation feedback (no external API needed)

## API Routes
- `POST /api/plan/generate` - Generate day plan from onboarding data
- `PATCH /api/plan/:id` - Update plan item status (done/skip)

## Recent Changes
- 2026-02-14: Switched Voice-to-Action from MiniMax ASR to browser Web Speech API
  - Removed `/api/voice/transcribe` backend endpoint (no longer needed)
  - Frontend: `useVoiceRecorder` hook using Web Speech API (SpeechRecognition)
  - Incident detection via keyword matching runs entirely client-side
  - CSS: voice-pulse and incident-sparkle animations
