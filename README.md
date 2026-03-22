# Greenpeace Africa Intelligence

An Africa-first campaign intelligence workspace for Greenpeace Africa.

This project is a simpler monitoring system focused on:

- campaign signal tracking across Africa
- heatmapping where issues are intensifying
- external mentions of Greenpeace Africa content and people
- fast scanning of developments across key campaign areas

## Campaign Areas

- Oceans
- Water
- Biodiversity
- Forests
- Climate and Energy
- Plastics
- Oil and Gas
- Food Sovereignty

## What The App Does Now

### Signals Monitoring

- **Africa-first map** centered on the continent by default
- **Signals feed** for campaign-relevant developments
- **Heatmap + markers** driven by signal priority
- **Campaign area filters** for the eight Greenpeace Africa focus areas
- **Priority model** using `critical`, `high`, `medium`, `low`, and `watch`

### Mentions Monitoring

- **Mentions tab** for external references to Greenpeace Africa
- **External mention detection** for:
  - `Greenpeace Africa`
  - `greenpeaceafrica.org`
  - Greenpeace Africa campaigners/spokespeople
- **Africa relevance filtering** so mentions stay focused on the continent

## Product Shape

The UI is intentionally small:

- **Map**
- **Signals**
- **Mentions**

That is the current working shape of the app.

## Current Architecture

### Core domain model

The app still uses the existing `ThreatEvent` name internally in some places for compatibility, but semantically it now represents campaign signals.

Main definitions live in:

- `types/index.ts`
- `lib/event-classifier.ts`
- `lib/ai-classifier.ts`

### Main routes

- `app/api/events/route.ts`
  - campaign signal ingestion
  - Africa-focused campaign queries
- `app/api/mentions/route.ts`
  - external Greenpeace Africa mention lookup
- `app/api/deepresearch/*`
  - legacy research workflow still present in the codebase

### Main UI

- `app/page.tsx`
  - app shell
- `components/map/threat-map.tsx`
  - Africa-first map, heatmap, markers, popups
- `components/feed/*`
  - signals feed and filters
- `components/mentions/*`
  - mentions feed
- `components/sidebar.tsx`
  - `Signals` / `Mentions` tabs

## Getting Started

### Prerequisites

- Node.js 18+
- Mapbox token
- Valyu API key
- OpenAI API key if you want AI-assisted classification and better location extraction

### Installation

```bash
npm install
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
VALYU_API_KEY=your_valyu_api_key_here
NEXT_PUBLIC_APP_MODE=self-hosted

# Optional but recommended for better classification
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4.1-nano
```

Run the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Authentication Modes

The app supports:

- `self-hosted`
- `valyu`

### Self-hosted

Use your own Valyu API key:

```env
NEXT_PUBLIC_APP_MODE=self-hosted
VALYU_API_KEY=your_valyu_api_key_here
```

### Valyu OAuth

```env
NEXT_PUBLIC_APP_MODE=valyu
NEXT_PUBLIC_VALYU_AUTH_URL=https://auth.valyu.ai
NEXT_PUBLIC_VALYU_CLIENT_ID=your-client-id
VALYU_CLIENT_SECRET=your-client-secret
VALYU_APP_URL=https://platform.valyu.ai
NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000/auth/valyu/callback
```

## Mention Targets

The default mention tracking configuration currently lives in:

- `lib/greenpeace-config.ts`

There are now two ways to extend tracked targets:

- code defaults in `lib/greenpeace-config.ts`
- custom targets added from the `Mentions` tab UI

Custom targets are stored locally in the browser and sent to `/api/mentions` when the feed refreshes.

You can add:

- named campaigners
- spokespeople
- article URLs
- campaign pages
- branded campaign names or hashtags

## Notes On Scope

This is not yet a full social-firehose listening platform.

The current mentions pipeline is a strong starting point for:

- web/news references
- external pickup of Greenpeace Africa references
- campaign-related monitoring across Africa

Future expansions could include:

1. broader social source ingestion
2. server-backed alert delivery
3. team-shared watchlists
4. annotation and triage workflows

## Mentions Workflow

The `Mentions` tab now supports:

- custom targets added in the UI
- saved watchlists for reusable target sets
- country filtering
- source-type filtering
- server-backed review state for mentions
- saved mentions for later follow-up
- lightweight alerts for:
  - high-priority mentions
  - mention spikes by target
  - top countries by mention volume

Custom targets and watchlists are currently stored locally in the browser.
Review state, saved mentions, and alert preferences are now persisted on the server in a local data file for this project.

## Verification

Type-check verification:

```bash
npx tsc --noEmit
```

`npm run build` may fail in some Windows sandboxed environments with a `spawn EPERM` error even after compilation succeeds. In this workspace, TypeScript verification completed successfully.
