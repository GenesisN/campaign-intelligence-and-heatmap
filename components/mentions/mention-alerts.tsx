"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { CampaignMention } from "@/types";
import { BellRing, TrendingUp, AlertTriangle, MapPinned } from "lucide-react";

interface MentionAlertPreferences {
  spikeThreshold: number;
  showHighPriority: boolean;
  showSpikes: boolean;
}

interface MentionAlertsProps {
  mentions: CampaignMention[];
  reviewedUrls: string[];
  alertPreferences: MentionAlertPreferences;
  onAlertPreferencesChange: (preferences: MentionAlertPreferences) => void;
}

function buildSpikeAlerts(mentions: CampaignMention[], threshold: number) {
  const recentWindow = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const grouped = new Map<string, number>();

  mentions.forEach((mention) => {
    if (new Date(mention.timestamp).getTime() < recentWindow) {
      return;
    }
    grouped.set(mention.matchedTarget, (grouped.get(mention.matchedTarget) || 0) + 1);
  });

  return Array.from(grouped.entries())
    .filter(([, count]) => count >= threshold)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
}

export function MentionAlerts({
  mentions,
  reviewedUrls,
  alertPreferences,
  onAlertPreferencesChange,
}: MentionAlertsProps) {
  const unresolvedMentions = mentions.filter(
    (mention) => mention.sourceUrl && !reviewedUrls.includes(mention.sourceUrl)
  );
  const urgentMentions = unresolvedMentions.filter(
    (mention) => mention.threatLevel === "critical" || mention.threatLevel === "high"
  );
  const spikeAlerts = buildSpikeAlerts(
    unresolvedMentions,
    alertPreferences.spikeThreshold
  );
  const topCountries = Array.from(
    unresolvedMentions.reduce((acc, mention) => {
      const country = mention.location?.country;
      if (country) {
        acc.set(country, (acc.get(country) || 0) + 1);
      }
      return acc;
    }, new Map<string, number>())
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  if (
    (!alertPreferences.showHighPriority || urgentMentions.length === 0) &&
    (!alertPreferences.showSpikes || spikeAlerts.length === 0) &&
    topCountries.length === 0
  ) {
    return null;
  }

  return (
    <div className="border-b border-border bg-card/60 p-4 backdrop-blur-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BellRing className="h-4 w-4 text-primary" />
          <p className="text-sm font-medium text-foreground">Alerts</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={alertPreferences.showHighPriority}
              onChange={(e) =>
                onAlertPreferencesChange({
                  ...alertPreferences,
                  showHighPriority: e.target.checked,
                })
              }
            />
            Urgent
          </label>
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={alertPreferences.showSpikes}
              onChange={(e) =>
                onAlertPreferencesChange({
                  ...alertPreferences,
                  showSpikes: e.target.checked,
                })
              }
            />
            Spikes
          </label>
          <label className="flex items-center gap-1">
            Spike threshold
            <select
              value={alertPreferences.spikeThreshold}
              onChange={(e) =>
                onAlertPreferencesChange({
                  ...alertPreferences,
                  spikeThreshold: Number(e.target.value),
                })
              }
              className="h-7 rounded-md border border-input bg-transparent px-2 text-xs"
            >
              {[2, 3, 4, 5].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="grid gap-3">
        {alertPreferences.showHighPriority && urgentMentions.length > 0 && (
          <Card className="border-red-500/30 bg-gradient-to-r from-red-500/10 to-transparent">
            <CardContent className="flex items-center gap-3 p-3">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {urgentMentions.length} unresolved high-priority mention{urgentMentions.length > 1 ? "s" : ""}
                </p>
                <p className="text-xs text-muted-foreground">
                  Review these before they disappear into the feed.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {alertPreferences.showSpikes && spikeAlerts.length > 0 && (
          <Card className="border-orange-500/30 bg-gradient-to-r from-orange-500/10 to-transparent">
            <CardContent className="p-3">
              <div className="mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-orange-400" />
                <p className="text-sm font-medium text-foreground">Spike signals</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {spikeAlerts.map(([target, count]) => (
                  <Badge key={target} variant="outline">
                    {target}: {count}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {topCountries.length > 0 && (
          <Card className="border-sky-500/30 bg-gradient-to-r from-sky-500/10 to-transparent">
            <CardContent className="p-3">
              <div className="mb-2 flex items-center gap-2">
                <MapPinned className="h-4 w-4 text-sky-400" />
                <p className="text-sm font-medium text-foreground">Top countries in mentions</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {topCountries.map(([country, count]) => (
                  <Badge key={country} variant="outline">
                    {country}: {count}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
