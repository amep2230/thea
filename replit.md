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
- **Voice-to-Action**: Record voice describing incident, transcribed via MiniMax ASR API, auto-detects incident type with sparkle animation feedback

## API Routes
- `POST /api/plan/generate` - Generate day plan from onboarding data
- `PATCH /api/plan/:id` - Update plan item status (done/skip)
- `POST /api/voice/transcribe` - Voice transcription via MiniMax Speech-to-Text (multipart/form-data with `audio` field)

## Environment Variables
- `MINIMAX_API_KEY` - MiniMax API key for speech-to-text
- `MINIMAX_GROUP_ID` - MiniMax Group ID for API calls

## Recent Changes
- 2026-02-14: Added Voice-to-Action feature to incident reporting
  - Backend: `/api/voice/transcribe` endpoint with multer + MiniMax ASR proxy
  - Frontend: `useVoiceRecorder` hook using MediaRecorder API
  - CSS: voice-pulse and incident-sparkle animations
  - Keyword-based incident type detection from transcribed text
