"use client";

import { useEffect, useMemo, useState } from "react";
import { useMentions } from "@/hooks/use-mentions";
import { useMentionState } from "@/hooks/use-mention-state";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2, Quote, Filter } from "lucide-react";
import { MentionCard } from "./mention-card";
import { MentionTargetManager } from "./mention-target-manager";
import { MentionAlerts } from "./mention-alerts";
import {
  MentionWatchlists,
  type MentionWatchlist,
} from "./mention-watchlists";
import type { MentionTarget } from "@/lib/greenpeace-config";
import type { CampaignMention, MentionSourceType } from "@/types";

const CUSTOM_TARGETS_STORAGE_KEY = "greenpeace_africa_custom_mention_targets";
const WATCHLISTS_STORAGE_KEY = "greenpeace_africa_mention_watchlists";

type ReviewFilter = "all" | "unreviewed" | "saved";

export function MentionsFeed() {
  const [customTargets, setCustomTargets] = useState<MentionTarget[]>([]);
  const [watchlists, setWatchlists] = useState<MentionWatchlist[]>([]);
  const [countryFilter, setCountryFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState<"all" | MentionSourceType>("all");
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>("all");

  useEffect(() => {
    try {
      const rawTargets = localStorage.getItem(CUSTOM_TARGETS_STORAGE_KEY);
      if (rawTargets) {
        const parsedTargets = JSON.parse(rawTargets);
        if (Array.isArray(parsedTargets)) {
          setCustomTargets(parsedTargets);
        }
      }

      const rawWatchlists = localStorage.getItem(WATCHLISTS_STORAGE_KEY);
      if (rawWatchlists) {
        const parsedWatchlists = JSON.parse(rawWatchlists);
        if (Array.isArray(parsedWatchlists)) {
          setWatchlists(parsedWatchlists);
        }
      }
    } catch {
      // Ignore malformed local storage state
    }
  }, []);

  const persistTargets = (nextTargets: MentionTarget[]) => {
    setCustomTargets(nextTargets);
    localStorage.setItem(CUSTOM_TARGETS_STORAGE_KEY, JSON.stringify(nextTargets));
  };

  const persistWatchlists = (nextWatchlists: MentionWatchlist[]) => {
    setWatchlists(nextWatchlists);
    localStorage.setItem(WATCHLISTS_STORAGE_KEY, JSON.stringify(nextWatchlists));
  };

  const { mentions, isLoading, error } = useMentions({
    autoRefresh: true,
    refreshInterval: 600000,
    targets: customTargets,
  });

  const {
    reviewedUrls,
    savedUrls,
    alertPreferences,
    toggleReviewed,
    toggleSaved,
    updateAlertPreferences,
  } = useMentionState();

  const handleAddTarget = (target: MentionTarget) => {
    const exists = customTargets.some(
      (item) =>
        item.label.toLowerCase() === target.label.toLowerCase() &&
        item.kind === target.kind &&
        item.query.toLowerCase() === target.query.toLowerCase()
    );

    if (exists) {
      return;
    }

    persistTargets([...customTargets, target]);
  };

  const handleRemoveTarget = (index: number) => {
    persistTargets(customTargets.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleSaveWatchlist = (name: string) => {
    const nextWatchlist: MentionWatchlist = {
      id: `watchlist_${Date.now()}`,
      name,
      targets: customTargets,
    };

    const deduped = [
      ...watchlists.filter((item) => item.name.toLowerCase() !== name.toLowerCase()),
      nextWatchlist,
    ];
    persistWatchlists(deduped);
  };

  const handleLoadWatchlist = (watchlist: MentionWatchlist) => {
    persistTargets(watchlist.targets);
  };

  const handleDeleteWatchlist = (id: string) => {
    persistWatchlists(watchlists.filter((watchlist) => watchlist.id !== id));
  };

  const availableCountries = useMemo(() => {
    return Array.from(
      new Set(
        mentions
          .map((mention) => mention.location?.country)
          .filter((country): country is string => Boolean(country))
      )
    ).sort((a, b) => a.localeCompare(b));
  }, [mentions]);

  const availableSources = useMemo(() => {
    return Array.from(new Set(mentions.map((mention) => mention.sourceType))).sort();
  }, [mentions]);

  const filteredMentions = useMemo(() => {
    let nextMentions: CampaignMention[] = mentions;

    if (countryFilter !== "all") {
      nextMentions = nextMentions.filter(
        (mention) => mention.location?.country === countryFilter
      );
    }

    if (sourceFilter !== "all") {
      nextMentions = nextMentions.filter(
        (mention) => mention.sourceType === sourceFilter
      );
    }

    if (reviewFilter === "unreviewed") {
      nextMentions = nextMentions.filter(
        (mention) => mention.sourceUrl && !reviewedUrls.includes(mention.sourceUrl)
      );
    }

    if (reviewFilter === "saved") {
      nextMentions = nextMentions.filter(
        (mention) => mention.sourceUrl && savedUrls.includes(mention.sourceUrl)
      );
    }

    return nextMentions;
  }, [countryFilter, mentions, reviewFilter, reviewedUrls, savedUrls, sourceFilter]);

  const unresolvedCount = mentions.filter(
    (mention) => mention.sourceUrl && !reviewedUrls.includes(mention.sourceUrl)
  ).length;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-border bg-card/80 p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Mentions</h2>
            <p className="text-sm text-muted-foreground">
              External references to Greenpeace Africa content and people
            </p>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <Badge variant="outline">{mentions.length} total</Badge>
            <Badge variant="outline">{unresolvedCount} unresolved</Badge>
          </div>
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="pb-4">
          <MentionTargetManager
            targets={customTargets}
            onAddTarget={handleAddTarget}
            onRemoveTarget={handleRemoveTarget}
          />

          <MentionWatchlists
            watchlists={watchlists}
            currentTargets={customTargets}
            onSaveWatchlist={handleSaveWatchlist}
            onLoadWatchlist={handleLoadWatchlist}
            onDeleteWatchlist={handleDeleteWatchlist}
          />

          <div className="border-b border-border bg-card/40 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Filter className="h-4 w-4 text-primary" />
              <p className="text-sm font-medium text-foreground">Review Filters</p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <p className="mb-1 text-xs text-muted-foreground">Country</p>
                <select
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                >
                  <option value="all">All countries</option>
                  {availableCountries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="mb-1 text-xs text-muted-foreground">Source</p>
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value as "all" | MentionSourceType)}
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                >
                  <option value="all">All source types</option>
                  {availableSources.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="mb-1 text-xs text-muted-foreground">Status</p>
                <select
                  value={reviewFilter}
                  onChange={(e) => setReviewFilter(e.target.value as ReviewFilter)}
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                >
                  <option value="all">All mentions</option>
                  <option value="unreviewed">Unreviewed only</option>
                  <option value="saved">Saved only</option>
                </select>
              </div>
            </div>
          </div>

          <MentionAlerts
            mentions={filteredMentions}
            reviewedUrls={reviewedUrls}
            alertPreferences={alertPreferences}
            onAlertPreferencesChange={updateAlertPreferences}
          />

          <div className="p-4">
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Loading mentions...
                </span>
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-destructive/10 p-4 text-center">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {!isLoading && !error && filteredMentions.length === 0 && (
              <div className="py-8 text-center">
                <Quote className="mx-auto h-10 w-10 text-muted-foreground/50" />
                <p className="mt-3 text-sm text-muted-foreground">
                  No external mentions found for this view yet.
                </p>
              </div>
            )}

            <div className="space-y-3">
              {filteredMentions.map((mention) => (
                <MentionCard
                  key={mention.id}
                  mention={mention}
                  isReviewed={Boolean(
                    mention.sourceUrl && reviewedUrls.includes(mention.sourceUrl)
                  )}
                  isSaved={Boolean(
                    mention.sourceUrl && savedUrls.includes(mention.sourceUrl)
                  )}
                  onToggleReviewed={toggleReviewed}
                  onToggleSaved={toggleSaved}
                />
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
