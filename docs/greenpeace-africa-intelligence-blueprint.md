# Greenpeace Africa Intelligence Blueprint

## Goal

Repurpose this app from a generic threat map into a **Greenpeace Africa Intelligence system** focused on:

- campaign monitoring
- real-time issue detection
- Africa-focused conversation sensing
- mentions of Greenpeace Africa content and campaigners
- a simple map-based heat view of where issues are intensifying

The product should feel more like a **campaign signal desk** than a military or geopolitical dashboard.

## Best Product Shape

Keep the UI simpler by reducing the app to **three core views only**:

1. **Map**
   Shows campaign hotspots across Africa.
2. **Signals**
   A single feed of important developments and conversations.
3. **Mentions**
   References to Greenpeace Africa, campaign pages, spokespeople, and campaigners.

Everything else should be secondary and progressively disclosed.

## Recommended Information Model

Replace the current threat-first model with a campaign-intelligence model.

### Primary campaign areas

- Oceans
- Water
- Biodiversity
- Forests
- Climate and Energy
- Plastics
- Oil and Gas
- Food Sovereignty

### Signal types

Each item in the system should have a `signalType`:

- `development`
- `conversation`
- `mention`
- `campaign-update`

### Suggested event schema additions

The current `ThreatEvent` type can evolve into something closer to:

```ts
type CampaignTopic =
  | "oceans"
  | "water"
  | "biodiversity"
  | "forests"
  | "climate-energy"
  | "plastics"
  | "oil-gas"
  | "food-sovereignty";

type SignalType =
  | "development"
  | "conversation"
  | "mention"
  | "campaign-update";

type SignalIntensity = "critical" | "high" | "medium" | "low" | "watch";

interface CampaignSignal {
  id: string;
  title: string;
  summary: string;
  topic: CampaignTopic;
  signalType: SignalType;
  intensity: SignalIntensity;
  geographyFocus: "africa" | "regional" | "country" | "local";
  countries: string[];
  location?: GeoLocation;
  timestamp: string;
  source: string;
  sourceUrl?: string;
  language?: string;
  stakeholders?: string[];
  relatedCampaign?: string;
  conversationVolume?: number;
  engagementScore?: number;
  mentionTarget?: {
    kind: "article" | "campaigner" | "brand";
    name: string;
  };
}
```

This keeps the existing map/feed pattern, but changes the semantics from threat intelligence to campaign intelligence.

## Data Streams To Combine

This system should not rely on one feed. It should aggregate four streams and normalize them into one `CampaignSignal` model.

### 1. Real-time developments

Track news and policy developments relevant to campaign areas in Africa:

- oil discoveries, licensing rounds, pipeline decisions
- plastic bans, waste crises, recycling policy
- marine protected areas, fisheries disputes, offshore drilling
- droughts, floods, water access, dam conflicts
- deforestation, protected-area rollbacks, illegal logging, indigenous right
- biodiversity loss, species protection, mining encroachment
- renewables policy, coal/gas investments, grid transitions
- food systems, seed laws, indigenous seeds, food sovereignty

### 2. Conversation sensing

Track Africa-focused public conversation around campaign topics:

- X/Twitter
- YouTube
- Reddit
- TikTok if available through a provider
- blogs, forums, newsletters, issue-specific publishers

The aim is not full social firehose coverage on day one. Start with sources you can reliably ingest and classify.

### 3. Greenpeace mentions

Track references to:

- Greenpeace Africa
- Greenpeace Africa campaign pages
- specific article URLs
- campaigners and spokespeople
- branded campaign names and hashtags

This should detect:

- direct links
- text mentions without links
- quoted campaigners
- article pick-up and republication

### 4. Internal campaign signals

Add optional manual or internal inputs:

- campaign launches
- planned mobilizations
- priority countries
- target companies
- priority narratives

This makes the dashboard useful even when external data is quiet.

## How To Keep The UI Simpler

The current app already has a map + sidebar structure. Keep that, but simplify what appears inside it.

### Recommended layout

- **Top bar**
  - product name
  - one date range control
  - one refresh button
  - one topic switcher
- **Main map**
  - Africa-first viewport
  - heatmap by signal intensity
  - simple point markers for high-priority items
- **Right rail**
  - tab 1: `Signals`
  - tab 2: `Mentions`

That is enough for the first useful version.

### Remove or demote from the current UI

- military base layer
- country conflict modal
- threat markets panel
- "dossier" language as a primary workflow
- too many category chips
- anything global-first instead of Africa-first

### Replace with simple controls

- campaign topic filter
- country filter
- signal type filter
- source type filter
- search

No more than 4 filter groups should be visible at once.

## Recommended UX Behavior

### Home screen defaults

- map zoomed to Africa
- `All campaign topics`
- `Last 7 days`
- feed sorted by intensity, then recency

### Marker behavior

- red/orange: urgent developments
- yellow: rising issue
- green/blue: lower-priority or informational activity
- pulsing ring: notable spike in conversation or mentions

### Feed cards should answer only 5 questions

- what happened?
- where?
- which campaign area?
- why it matters?
- who is amplifying or referencing it?

If a card cannot answer those, it is too verbose.

## Concrete Changes In This Codebase

### 1. Replace threat taxonomy

Files:

- `types/index.ts`
- `lib/event-classifier.ts`
- `lib/ai-classifier.ts`
- `components/feed/feed-filters.tsx`

What changes:

- replace current conflict/military-oriented categories with campaign topics
- rename `threatLevel` to a more neutral `intensity` or `priority`
- add `signalType`

### 2. Replace default queries

File:

- `app/api/events/route.ts`

What changes:

- remove generic threat queries
- use topic-specific Africa queries
- keep one query set per campaign area

Example query groups:

- `Africa oceans overfishing offshore drilling marine protected area`
- `Africa water scarcity river pollution dam community water access`
- `Africa biodiversity protected species conservation mining habitat loss`
- `Africa forest deforestation logging forest governance protected area`
- `Africa climate energy renewable transition coal methane gas energy policy`
- `Africa plastics pollution waste management single-use plastics recycling`
- `Africa oil gas licensing LNG refinery pipeline offshore exploration spill`

### 3. Add mention tracking pipeline

New concept:

- `mentionTargets`

Examples:

- Greenpeace Africa
- campaigner names
- article URLs
- campaign URLs
- branded phrases and hashtags

Suggested new route:

- `app/api/mentions/route.ts`

Responsibilities:

- search the web for references
- detect direct links or textual mentions
- classify each result into campaign topic(s)
- geolocate if Africa-relevant
- return normalized `CampaignSignal[]`

### 4. Split feed into Signals and Mentions

Files:

- `components/sidebar.tsx`
- `components/feed/event-feed.tsx`
- new `components/mentions/*`

What changes:

- current feed becomes `Signals`
- add a simpler `Mentions` tab
- keep search/research out of the primary sidebar unless users truly need it daily

### 5. Make the map Africa-first

Files:

- `stores/map-store.ts`
- `components/map/threat-map.tsx`

What changes:

- default viewport centered on Africa
- remove military base overlay
- remove country conflict click behavior
- clicking a country should filter the feed, not open a long modal

### 6. Simplify language throughout

Examples:

- `Global Threat Map` -> `Greenpeace Africa Intelligence`
- `Event Feed` -> `Signals`
- `Intel` -> `Mentions` or `Research`
- `Threat level` -> `Priority`
- `Category` -> `Campaign area`

## Minimal Viable Version

If you want the fastest path, build this in three milestones.

### Milestone 1: Campaign signal monitor

- replace taxonomy and queries
- Africa-only map
- single feed of developments
- heatmap by campaign topic and priority

### Milestone 2: Mentions and social sensing

- mention target registry
- web mention detection
- conversation-source ingestion
- "spike" detection for notable amplification

### Milestone 3: Workflow intelligence

- saved watchlists
- alerts by topic/country
- weekly digest
- manual annotations by campaign staff

## Suggested Scoring Logic

Each signal should get a simple score:

`priorityScore = relevance + recency + amplification + campaignFit + geographyWeight`

Example dimensions:

- `relevance`: how clearly it matches a campaign area
- `recency`: newer items score higher
- `amplification`: shares, backlinks, multiple pickups, repeat mentions
- `campaignFit`: aligns with Greenpeace Africa priorities
- `geographyWeight`: Africa-wide > regional > local, depending on your needs

Use this score both for feed ordering and heatmap intensity.

## Best First Build Decision

Do **not** start by building a perfect all-source social listening platform.

Start by doing these three things well:

1. Africa-focused campaign development detection
2. web mentions of Greenpeace Africa people/content
3. a very simple heatmap + feed interface

That will get you a usable internal intelligence product faster, and the current codebase is already close to supporting that structure.

## Practical Recommendation For This Repo

If we continue adapting this codebase, the best next implementation step is:

1. rename the domain model from threat events to campaign signals
2. replace the query pack in `/api/events`
3. simplify the UI to `Map + Signals + Mentions`
4. remove military/conflict-specific UI paths

That gives you a cleaner product without a major rewrite.
