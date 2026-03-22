import { NextResponse } from "next/server";
import { searchEvents } from "@/lib/valyu";
import { isSelfHostedMode } from "@/lib/app-mode";
import { classifyEvent } from "@/lib/ai-classifier";
import { generateEventId } from "@/lib/utils";
import {
  DEFAULT_MENTION_TARGETS,
  AFRICAN_COUNTRIES,
  MAX_CUSTOM_MENTION_TARGETS,
  MENTION_QUERY_VARIANTS,
  type MentionTarget,
} from "@/lib/greenpeace-config";
import type { CampaignMention } from "@/types";

export const dynamic = "force-dynamic";

function cleanText(text: string): string {
  return text
    .replace(/skip to (?:main |primary )?content/gi, "")
    .replace(/keyboard shortcuts?/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function isExternalMention(url: string): boolean {
  const lower = url.toLowerCase();
  return !lower.includes("greenpeaceafrica.org") && !lower.includes("greenpeace.org/africa");
}

function classifySourceType(url: string): CampaignMention["sourceType"] {
  const lower = url.toLowerCase();
  if (
    lower.includes("x.com") ||
    lower.includes("twitter.com") ||
    lower.includes("facebook.com") ||
    lower.includes("instagram.com") ||
    lower.includes("tiktok.com")
  ) {
    return "social";
  }
  if (lower.includes("reddit.com")) {
    return "forum";
  }
  if (lower.includes("youtube.com") || lower.includes("youtu.be")) {
    return "video";
  }
  if (lower.includes("medium.com") || lower.includes("substack.com") || lower.includes("blog")) {
    return "blog";
  }
  if (
    lower.includes("/news/") ||
    lower.includes("reuters.com") ||
    lower.includes("apnews.com") ||
    lower.includes("bbc.") ||
    lower.includes("aljazeera.")
  ) {
    return "news";
  }
  return "web";
}

function isAfricaRelevant(
  title: string,
  content: string,
  country?: string | null
): boolean {
  if (country && AFRICAN_COUNTRIES.has(country.toLowerCase())) {
    return true;
  }

  const combined = `${title} ${content}`.toLowerCase();
  if (combined.includes("africa") || combined.includes("african")) {
    return true;
  }

  return Array.from(AFRICAN_COUNTRIES).some((name) => combined.includes(name));
}

function normalizeCustomTargets(value: unknown): MentionTarget[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const record = item as Record<string, unknown>;
      const label = typeof record.label === "string" ? record.label.trim() : "";
      const query = typeof record.query === "string" ? record.query.trim() : label;
      const kind = record.kind;

      if (!label || !query) {
        return null;
      }

      if (
        kind !== "brand" &&
        kind !== "domain" &&
        kind !== "campaigner" &&
        kind !== "article"
      ) {
        return null;
      }

      return {
        label,
        query,
        kind,
      } satisfies MentionTarget;
    })
    .filter((item): item is MentionTarget => item !== null)
    .slice(0, MAX_CUSTOM_MENTION_TARGETS);
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { accessToken, targets } = body;

    const selfHosted = isSelfHostedMode();
    if (!selfHosted && !accessToken) {
      return NextResponse.json(
        { error: "Authentication required", requiresReauth: true },
        { status: 401 }
      );
    }

    const customTargets = normalizeCustomTargets(targets);
    const activeTargets = [...DEFAULT_MENTION_TARGETS, ...customTargets].filter(
      (target, index, self) =>
        index ===
        self.findIndex(
          (item) =>
            item.label.toLowerCase() === target.label.toLowerCase() &&
            item.query.toLowerCase() === target.query.toLowerCase() &&
            item.kind === target.kind
        )
    );

    const searchResultsArrays = await Promise.all(
      activeTargets.flatMap((target) =>
        MENTION_QUERY_VARIANTS.map((variant) =>
          searchEvents(`${target.query} ${variant.suffix}`, {
            maxResults: 6,
            accessToken,
            searchType: "all",
          }).then((result) => ({
            target,
            variant: variant.id,
            results: result.results,
            requiresReauth: result.requiresReauth,
          }))
        )
      )
    );

    const requiresReauth = searchResultsArrays.some((item) => item.requiresReauth);
    if (requiresReauth) {
      return NextResponse.json(
        { error: "auth_error", message: "Session expired. Please sign in again.", requiresReauth: true },
        { status: 401 }
      );
    }

    const mentions = await Promise.all(
      searchResultsArrays.flatMap(({ target, results }) =>
        results.map(async (result) => {
          if (!result.url || !isExternalMention(result.url)) {
            return null;
          }

          const title = cleanText(result.title || "Untitled");
          const content = cleanText(result.content || "");
          const classification = await classifyEvent(title, content);

          if (!isAfricaRelevant(title, content, classification.location?.country)) {
            return null;
          }

          const mention: CampaignMention = {
            id: generateEventId(),
            title,
            summary: content.slice(0, 400),
            matchedTarget: target.label,
            mentionType: target.kind,
            sourceType: classifySourceType(result.url),
            category: classification.category,
            threatLevel: classification.threatLevel,
            signalType: "campaign",
            location: classification.location || undefined,
            timestamp: result.publishedDate || new Date().toISOString(),
            source: result.source || "web",
            sourceUrl: result.url,
          };

          return mention;
        })
      )
    );

    const deduped = mentions
      .filter((item): item is CampaignMention => item !== null)
      .filter(
        (mention, index, self) =>
          index === self.findIndex((item) => item.sourceUrl === mention.sourceUrl)
      )
      .sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3, watch: 4 };
        const priorityA = priorityOrder[a.threatLevel] ?? 5;
        const priorityB = priorityOrder[b.threatLevel] ?? 5;
        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });

    return NextResponse.json({
      mentions: deduped,
      count: deduped.length,
      targets: activeTargets,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching mentions:", error);
    return NextResponse.json(
      { error: "Failed to fetch mentions" },
      { status: 500 }
    );
  }
}
