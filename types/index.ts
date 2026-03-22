import { z } from "zod";

export const ThreatLevel = z.enum(["critical", "high", "medium", "low", "watch"]);
export type ThreatLevel = z.infer<typeof ThreatLevel>;

export const EventCategory = z.enum([
  "oceans",
  "water",
  "biodiversity",
  "forests",
  "climate-energy",
  "plastics",
  "oil-gas",
  "food-sovereignty",
]);
export type EventCategory = z.infer<typeof EventCategory>;

export const SignalType = z.enum([
  "development",
  "policy",
  "community",
  "campaign",
]);
export type SignalType = z.infer<typeof SignalType>;

export const GeoLocation = z.object({
  latitude: z.number(),
  longitude: z.number(),
  placeName: z.string().optional(),
  country: z.string().optional(),
  region: z.string().optional(),
});
export type GeoLocation = z.infer<typeof GeoLocation>;

export const ThreatEvent = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  category: EventCategory,
  threatLevel: ThreatLevel,
  signalType: SignalType,
  location: GeoLocation,
  timestamp: z.string().datetime(),
  source: z.string(),
  sourceUrl: z.string().url().optional(),
  entities: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
  rawContent: z.string().optional(),
});
export type ThreatEvent = z.infer<typeof ThreatEvent>;

export const MentionType = z.enum(["brand", "domain", "campaigner", "article"]);
export type MentionType = z.infer<typeof MentionType>;

export const MentionSourceType = z.enum([
  "news",
  "social",
  "forum",
  "video",
  "blog",
  "web",
]);
export type MentionSourceType = z.infer<typeof MentionSourceType>;

export const CampaignMention = z.object({
  id: z.string(),
  title: z.string(),
  summary: z.string(),
  matchedTarget: z.string(),
  mentionType: MentionType,
  sourceType: MentionSourceType,
  category: EventCategory,
  threatLevel: ThreatLevel,
  signalType: SignalType,
  location: GeoLocation.optional(),
  timestamp: z.string().datetime(),
  source: z.string(),
  sourceUrl: z.string().url().optional(),
});
export type CampaignMention = z.infer<typeof CampaignMention>;

export const EntityProfile = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["organization", "person", "country", "group"]),
  description: z.string().optional(),
  locations: z.array(GeoLocation).optional(),
  relatedEntities: z
    .array(
      z.object({
        name: z.string(),
        relationship: z.string(),
      })
    )
    .optional(),
  economicData: z.record(z.string(), z.unknown()).optional(),
  recentEvents: z.array(z.string()).optional(),
  researchSummary: z.string().optional(),
});
export type EntityProfile = z.infer<typeof EntityProfile>;

export interface MapViewport {
  longitude: number;
  latitude: number;
  zoom: number;
  bearing?: number;
  pitch?: number;
}

export interface TimeRange {
  start: Date;
  end: Date;
}

export const threatLevelColors: Record<ThreatLevel, string> = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#22c55e",
  watch: "#38bdf8",
};

export const categoryIcons: Record<EventCategory, string> = {
  oceans: "Waves",
  water: "Droplets",
  biodiversity: "Leaf",
  forests: "Trees",
  "climate-energy": "Zap",
  plastics: "Recycle",
  "oil-gas": "Flame",
  "food-sovereignty": "Sprout",
};
