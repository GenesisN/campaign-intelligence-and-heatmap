import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import type { EventCategory, ThreatLevel, GeoLocation, SignalType } from "@/types";
import { geocodeLocation, extractLocationsFromText } from "./geocoding";
import {
  classifyCategory as keywordClassifyCategory,
  classifyThreatLevel as keywordClassifyThreatLevel,
  classifySignalType as keywordClassifySignalType,
} from "./event-classifier";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-nano";

const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

const EventClassificationSchema = z.object({
  category: z.enum([
    "oceans",
    "water",
    "biodiversity",
    "forests",
    "climate-energy",
    "plastics",
    "oil-gas",
    "food-sovereignty",
  ]),
  threatLevel: z.enum(["critical", "high", "medium", "low", "watch"]),
  signalType: z.enum(["development", "policy", "community", "campaign"]),
  primaryLocation: z.string(),
  city: z.string().nullable(),
  region: z.string().nullable(),
  country: z.string().nullable(),
});

type EventClassification = z.infer<typeof EventClassificationSchema>;

export interface ClassificationResult {
  category: EventCategory;
  threatLevel: ThreatLevel;
  signalType: SignalType;
  location: GeoLocation | null;
}

async function classifyWithAI(
  title: string,
  content: string
): Promise<EventClassification | null> {
  if (!openai) return null;

  try {
    const completion = await openai.chat.completions.parse({
      model: OPENAI_MODEL,
      messages: [
        {
          role: "system",
          content: `You are classifying Greenpeace Africa campaign-monitoring signals.

Return:
1. category
2. threatLevel
3. signalType
4. the most specific location possible

Categories:
- oceans
- water
- biodiversity
- forests
- climate-energy
- plastics
- oil-gas
- food-sovereignty

Signal types:
- development
- policy
- community
- campaign

Priority guidance:
- critical: urgent campaign issue, severe harm, major rollback, major spill or shutdown
- high: significant development, rapid escalation, major decision point
- medium: important developing issue
- low: minor localized development
- watch: background monitoring, routine update, analysis, statement

Location guidance:
- Always prefer the most specific African location mentioned
- If a city, protected area, coast, basin, forest, or river is named, use that instead of just the country
- Do not return vague regions when a concrete place is present`,
        },
        {
          role: "user",
          content: `Headline: ${title}\n\nContent: ${content.slice(0, 1000)}`,
        },
      ],
      response_format: zodResponseFormat(
        EventClassificationSchema,
        "event_classification"
      ),
      max_tokens: 250,
      temperature: 0,
    });

    const message = completion.choices[0]?.message;
    return message?.parsed ?? null;
  } catch (error) {
    console.error("AI classification error:", error);
    return null;
  }
}

export async function classifyEvent(
  title: string,
  content: string
): Promise<ClassificationResult> {
  const fullText = `${title} ${content}`;
  const aiResult = await classifyWithAI(title, content);

  if (aiResult) {
    let location: GeoLocation | null = null;

    if (aiResult.city && aiResult.country) {
      const cityQuery = aiResult.region
        ? `${aiResult.city}, ${aiResult.region}, ${aiResult.country}`
        : `${aiResult.city}, ${aiResult.country}`;
      location = await geocodeLocation(cityQuery);
    }

    if (!location && aiResult.primaryLocation) {
      location = await geocodeLocation(aiResult.primaryLocation);
    }

    if (!location && aiResult.region && aiResult.country) {
      location = await geocodeLocation(`${aiResult.region}, ${aiResult.country}`);
    }

    if (!location && aiResult.country) {
      location = await geocodeLocation(aiResult.country);
    }

    return {
      category: aiResult.category as EventCategory,
      threatLevel: aiResult.threatLevel as ThreatLevel,
      signalType: aiResult.signalType as SignalType,
      location,
    };
  }

  const category = keywordClassifyCategory(fullText);
  const threatLevel = keywordClassifyThreatLevel(fullText);
  const signalType = keywordClassifySignalType(fullText);

  const locationCandidates = extractLocationsFromText(fullText);
  let location: GeoLocation | null = null;

  for (const candidate of locationCandidates) {
    location = await geocodeLocation(candidate);
    if (location) break;
  }

  return {
    category,
    threatLevel,
    signalType,
    location,
  };
}

export function isAIClassificationEnabled(): boolean {
  return !!openai;
}
