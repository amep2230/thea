# Thea — Sick Day Companion for Parents

## Overview
Mobile-first web app helping parents manage their child's sick days. Guides them through onboarding, optional medication setup, and generates a personalized day plan with time-blocked activities, meals, rest, and medication reminders.

## Architecture
- **Frontend**: React + Vite, wouter routing, TanStack Query, Tailwind CSS, shadcn/ui
- **Backend**: Express.js (Node), in-memory storage (no database needed for core features)
- **Shared**: Zod schemas in `shared/schema.ts` and API contract in `shared/routes.ts`

## Screens
1. **Splash** (`/`) - Logo, tagline, disclaimer, CTA to start onboarding
2. **Onboarding** (`/onboarding`) - Multi-step wizard: child name, age, illness, energy levels
3. **Medication Setup** (`/medications`) - Optional medication entry with skip
4. **Day Plan** (`/plan`) - Generated timeline of activities, meals, rest, meds

## Key Features
- Day plan generation based on child energy level and illness
- **Hybrid Incident Reporting**: "Something changed" FAB opens a sheet where parents can:
  - Type or speak a free-form description (primary input)
  - Optionally select a quick-pick category (Fever spike, Threw up, Energy crash, Feeling better, Won't eat/drink)
  - Submit with either or both — no forced category selection
  - Auto-detection highlights matching category from typed text via keyword matching
- **MiniMax AI Plan Modification**: When an incident is reported, MiniMax M1 generates a personalized updated plan. Falls back to local generation if API unavailable.
- **Voice-to-Action**: Browser Web Speech API for voice recognition with client-side incident detection

## API Routes
- `POST /api/plan/generate` - Generate or modify day plan. Accepts optional `incident` (enum), `incidentDescription` (string), `existingPlan` (array). Either incident or description triggers AI-powered plan modification.
- `PATCH /api/plan/:id` - Update plan item status (done/skip)

## Recent Changes
- 2026-02-14: Hybrid incident input — users can type free-form descriptions without selecting a category
  - Server-side keyword detection infers incident type from description text
  - AI prompt handles description-only submissions intelligently
  - Frontend text-first UI with compact category pills as optional quick-select
  - Real-time auto-detection with debounced keyword matching on typed text
- 2026-02-14: MiniMax AI integration for incident-based plan modification
- 2026-02-14: Switched Voice-to-Action from MiniMax ASR to browser Web Speech API
