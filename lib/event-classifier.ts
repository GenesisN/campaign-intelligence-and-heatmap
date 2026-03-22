import type {
  EventCategory,
  ThreatLevel,
  ThreatEvent,
  SignalType,
  GeoLocation,
} from "@/types";
import { generateEventId } from "./utils";

const BOILERPLATE_PATTERNS = [
  /skip to (?:main |primary )?content/gi,
  /keyboard shortcuts?(?: for audio player)?/gi,
  /toggle navigation/gi,
  /search(?:\s+the site)?/gi,
  /sign (?:in|up|out)/gi,
  /log (?:in|out)/gi,
  /subscribe(?:\s+now)?/gi,
  /newsletter/gi,
  /privacy policy/gi,
  /terms (?:of (?:service|use)|and conditions)/gi,
  /cookie (?:policy|settings|preferences)/gi,
  /about us/gi,
  /contact us/gi,
  /advertise (?:with us)?/gi,
  /careers/gi,
  /all rights reserved/gi,
  /copyright \d{4}/gi,
  /follow us on/gi,
  /share (?:this|on)/gi,
  /related (?:articles|stories|posts)/gi,
  /recommended (?:for you|articles)/gi,
  /trending (?:now|stories)/gi,
  /most (?:read|popular|viewed)/gi,
  /read more/gi,
  /continue reading/gi,
  /load(?:ing)? more/gi,
  /view (?:all|more)/gi,
  /see (?:all|more)/gi,
  /advertisement/gi,
  /sponsored (?:content|by)/gi,
  /click here/gi,
  /tap (?:here|to)/gi,
  /download (?:our )?app/gi,
  /get the app/gi,
  /breaking news alert/gi,
  /live updates?/gi,
];

function cleanContent(text: string): string {
  let cleaned = text;

  for (const pattern of BOILERPLATE_PATTERNS) {
    cleaned = cleaned.replace(pattern, "");
  }

  return cleaned
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\s{2,}/g, " ")
    .replace(/^\s+|\s+$/gm, "")
    .trim();
}

const CATEGORY_KEYWORDS: Record<EventCategory, string[]> = {
  oceans: [
    "ocean",
    "marine",
    "fisheries",
    "fishing",
    "offshore",
    "coastal",
    "sea",
    "mangrove",
    "marine protected area",
    "deep sea",
  ],
  water: [
    "water",
    "river",
    "dam",
    "watershed",
    "drinking water",
    "sanitation",
    "water scarcity",
    "drought",
    "flood",
    "reservoir",
  ],
  biodiversity: [
    "biodiversity",
    "wildlife",
    "species",
    "habitat",
    "conservation",
    "ecosystem",
    "endangered",
    "poaching",
    "protected species",
    "wetlands",
  ],
  forests: [
    "forest",
    "deforestation",
    "logging",
    "timber",
    "rainforest",
    "land clearing",
    "tree cover",
    "forest governance",
    "protected forest",
    "woodland",
  ],
  "climate-energy": [
    "climate",
    "energy",
    "renewable",
    "solar",
    "wind",
    "coal",
    "methane",
    "electricity",
    "power sector",
    "energy transition",
  ],
  plastics: [
    "plastic",
    "plastics",
    "single-use",
    "waste",
    "recycling",
    "microplastic",
    "packaging",
    "landfill",
    "pollution",
    "circular economy",
  ],
  "oil-gas": [
    "oil",
    "gas",
    "lng",
    "pipeline",
    "refinery",
    "drilling",
    "spill",
    "exploration",
    "fossil fuel",
    "licensing",
  ],
  "food-sovereignty": [
    "food sovereignty",
    "agroecology",
    "food system",
    "farmer",
    "farmers",
    "seed",
    "smallholder",
    "food security",
    "land rights",
    "harvest",
  ],
};

const THREAT_LEVEL_KEYWORDS: Record<ThreatLevel, string[]> = {
  critical: [
    "emergency",
    "catastrophic",
    "urgent",
    "crisis",
    "devastating",
    "major spill",
    "severe pollution",
    "ban repealed",
  ],
  high: [
    "severe",
    "major",
    "significant",
    "escalating",
    "dangerous",
    "serious",
    "alarming",
    "warning",
  ],
  medium: [
    "moderate",
    "developing",
    "ongoing",
    "concern",
    "elevated",
    "increasing",
    "notable",
  ],
  low: [
    "minor",
    "limited",
    "contained",
    "isolated",
    "localized",
    "manageable",
    "stable",
  ],
  watch: [
    "update",
    "report",
    "announcement",
    "statement",
    "analysis",
    "brief",
    "summary",
    "overview",
  ],
};

export function classifyCategory(text: string): EventCategory {
  const lowerText = text.toLowerCase();
  let bestMatch: EventCategory = "climate-energy";
  let bestScore = 0;

  (Object.entries(CATEGORY_KEYWORDS) as [EventCategory, string[]][]).forEach(
    ([category, keywords]) => {
      const score = keywords.reduce((acc, keyword) => {
        return acc + (lowerText.includes(keyword.toLowerCase()) ? 1 : 0);
      }, 0);

      if (score > bestScore) {
        bestScore = score;
        bestMatch = category;
      }
    }
  );

  return bestMatch;
}

export function classifyThreatLevel(text: string): ThreatLevel {
  const lowerText = text.toLowerCase();

  for (const [level, keywords] of Object.entries(THREAT_LEVEL_KEYWORDS) as [
    ThreatLevel,
    string[],
  ][]) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        return level;
      }
    }
  }

  return "watch";
}

export function classifySignalType(text: string): SignalType {
  const lowerText = text.toLowerCase();

  if (
    lowerText.includes("policy") ||
    lowerText.includes("law") ||
    lowerText.includes("ban") ||
    lowerText.includes("regulation") ||
    lowerText.includes("court")
  ) {
    return "policy";
  }

  if (
    lowerText.includes("community") ||
    lowerText.includes("activist") ||
    lowerText.includes("protest") ||
    lowerText.includes("march")
  ) {
    return "community";
  }

  if (
    lowerText.includes("greenpeace") ||
    lowerText.includes("campaign") ||
    lowerText.includes("petition") ||
    lowerText.includes("statement")
  ) {
    return "campaign";
  }

  return "development";
}

export function extractEntities(text: string): string[] {
  const entities = new Set<string>();

  const orgPatterns = [
    /\b(Greenpeace Africa|African Union|UNEP|UN|FAO|WHO|World Bank|African Development Bank)\b/gi,
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:government|ministry|president|prime minister|agency|company)\b/gi,
  ];

  orgPatterns.forEach((pattern) => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      if (match[1]) {
        entities.add(match[1].trim());
      }
    }
  });

  return Array.from(entities);
}

export function extractKeywords(text: string): string[] {
  const allKeywords = [
    ...Object.values(CATEGORY_KEYWORDS).flat(),
    ...Object.values(THREAT_LEVEL_KEYWORDS).flat(),
  ];

  const lowerText = text.toLowerCase();
  const found = allKeywords.filter((keyword) =>
    lowerText.includes(keyword.toLowerCase())
  );

  return [...new Set(found)].slice(0, 10);
}

export function createThreatEvent(
  title: string,
  content: string,
  location: GeoLocation,
  source: string,
  sourceUrl?: string,
  timestamp?: string
): ThreatEvent {
  const cleanedTitle = cleanContent(title);
  const cleanedContent = cleanContent(content);
  const fullText = `${cleanedTitle} ${cleanedContent}`;

  return {
    id: generateEventId(),
    title: cleanedTitle,
    summary: cleanedContent.slice(0, 500),
    category: classifyCategory(fullText),
    threatLevel: classifyThreatLevel(fullText),
    signalType: classifySignalType(fullText),
    location,
    timestamp: timestamp || new Date().toISOString(),
    source,
    sourceUrl,
    entities: extractEntities(fullText),
    keywords: extractKeywords(fullText),
    rawContent: cleanedContent,
  };
}
