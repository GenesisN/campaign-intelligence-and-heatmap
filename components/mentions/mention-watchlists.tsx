"use client";

import { useState } from "react";
import type { MentionTarget } from "@/lib/greenpeace-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BookmarkPlus, FolderOpen, Trash2 } from "lucide-react";

export interface MentionWatchlist {
  id: string;
  name: string;
  targets: MentionTarget[];
}

interface MentionWatchlistsProps {
  watchlists: MentionWatchlist[];
  currentTargets: MentionTarget[];
  onSaveWatchlist: (name: string) => void;
  onLoadWatchlist: (watchlist: MentionWatchlist) => void;
  onDeleteWatchlist: (id: string) => void;
}

export function MentionWatchlists({
  watchlists,
  currentTargets,
  onSaveWatchlist,
  onLoadWatchlist,
  onDeleteWatchlist,
}: MentionWatchlistsProps) {
  const [name, setName] = useState("");

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed || currentTargets.length === 0) {
      return;
    }

    onSaveWatchlist(trimmed);
    setName("");
  };

  return (
    <div className="border-b border-border p-4 space-y-3">
      <div>
        <p className="text-sm font-medium text-foreground">Watchlists</p>
        <p className="text-xs text-muted-foreground">
          Save reusable target sets for campaigns, spokespeople, or issue clusters.
        </p>
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-2">
        <Input
          placeholder="Watchlist name e.g. Oil and Gas Voices"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button onClick={handleSave} type="button" size="sm" disabled={currentTargets.length === 0}>
          <BookmarkPlus className="mr-1 h-4 w-4" />
          Save
        </Button>
      </div>

      {watchlists.length > 0 && (
        <div className="space-y-2">
          {watchlists.map((watchlist) => (
            <div
              key={watchlist.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {watchlist.name}
                </p>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline">{watchlist.targets.length} targets</Badge>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onLoadWatchlist(watchlist)}
                  title={`Load ${watchlist.name}`}
                  className="h-8 w-8"
                >
                  <FolderOpen className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeleteWatchlist(watchlist.id)}
                  title={`Delete ${watchlist.name}`}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
