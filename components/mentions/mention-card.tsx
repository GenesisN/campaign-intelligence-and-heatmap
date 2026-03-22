"use client";

import type { CampaignMention } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatLabel, formatRelativeTime } from "@/lib/utils";
import {
  ExternalLink,
  MapPin,
  Quote,
  Bookmark,
  CheckCircle2,
} from "lucide-react";

interface MentionCardProps {
  mention: CampaignMention;
  isReviewed: boolean;
  isSaved: boolean;
  onToggleReviewed: (url: string) => void;
  onToggleSaved: (url: string) => void;
}

export function MentionCard({
  mention,
  isReviewed,
  isSaved,
  onToggleReviewed,
  onToggleSaved,
}: MentionCardProps) {
  const sourceUrl = mention.sourceUrl || "";

  return (
    <Card
      className={`overflow-hidden border transition-all duration-200 hover:bg-accent/40 ${
        isReviewed ? "border-border/60 opacity-80" : "border-border"
      }`}
    >
      <CardContent className="p-0">
        <div className="border-b border-border/70 bg-gradient-to-r from-primary/10 to-transparent px-3 py-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Quote className="h-3.5 w-3.5 text-primary" />
              <Badge variant="outline" className="capitalize">
                {formatLabel(mention.mentionType)}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {formatLabel(mention.sourceType)}
              </Badge>
              <Badge variant={mention.threatLevel} className="capitalize">
                {formatLabel(mention.threatLevel)}
              </Badge>
              {isReviewed && <Badge variant="outline">Reviewed</Badge>}
              {isSaved && <Badge variant="outline">Saved</Badge>}
            </div>

            {sourceUrl && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onToggleSaved(sourceUrl)}
                  className={`rounded p-1 transition-colors ${
                    isSaved ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                  title={isSaved ? "Unsave mention" : "Save mention"}
                >
                  <Bookmark className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onToggleReviewed(sourceUrl)}
                  className={`rounded p-1 transition-colors ${
                    isReviewed ? "text-green-400" : "text-muted-foreground hover:text-foreground"
                  }`}
                  title={isReviewed ? "Mark as unreviewed" : "Mark as reviewed"}
                >
                  <CheckCircle2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <a
                href={mention.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="line-clamp-2 text-sm font-medium text-foreground hover:text-primary"
              >
                {mention.title}
              </a>

              <p className="mt-1 line-clamp-3 text-xs leading-5 text-muted-foreground">
                {mention.summary}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="capitalize">
                  {formatLabel(mention.category)}
                </Badge>
                <span className="rounded-full bg-muted/60 px-2 py-1">
                  Matched: {mention.matchedTarget}
                </span>
                {mention.location && (
                  <span className="flex items-center gap-1 rounded-full bg-muted/60 px-2 py-1">
                    <MapPin className="h-3 w-3" />
                    {mention.location.placeName || mention.location.country || "Africa"}
                  </span>
                )}
                <span>{formatRelativeTime(mention.timestamp)}</span>
              </div>
            </div>

            {mention.sourceUrl && (
              <a
                href={mention.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-muted-foreground hover:text-primary"
                title="Open source"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
