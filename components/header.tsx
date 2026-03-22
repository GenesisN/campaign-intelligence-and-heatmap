"use client";

import { useEventsStore } from "@/stores/events-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe2, RefreshCw, Activity, HelpCircle, Leaf } from "lucide-react";

interface HeaderProps {
  onRefresh: () => void;
  isLoading: boolean;
  onShowHelp?: () => void;
}

export function Header({ onRefresh, isLoading, onShowHelp }: HeaderProps) {
  const { filteredEvents } = useEventsStore();

  const threatCounts = filteredEvents.reduce(
    (acc, event) => {
      acc[event.threatLevel] = (acc[event.threatLevel] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <header className="relative flex h-14 items-center justify-between border-b border-border bg-card px-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Leaf className="h-6 w-6 text-primary" />
          <h1 className="text-lg font-bold text-foreground">
            Greenpeace Africa Intelligence
          </h1>
        </div>
        <Badge variant="outline" className="hidden md:flex">
          <Activity className="mr-1 h-3 w-3" />
          Live Signals
        </Badge>
      </div>

      <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-2 text-sm text-muted-foreground lg:flex">
        <Globe2 className="h-4 w-4" />
        Africa-first campaign signal monitor
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-2 md:flex">
          {threatCounts.critical && (
            <Badge variant="critical">{threatCounts.critical} Critical</Badge>
          )}
          {threatCounts.high && (
            <Badge variant="high">{threatCounts.high} High</Badge>
          )}
          <Badge variant="outline">{filteredEvents.length} Signals</Badge>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onShowHelp}
          title="Show features"
        >
          <HelpCircle className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onRefresh}
          disabled={isLoading}
          title="Refresh signals"
        >
          <RefreshCw
            className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
          />
        </Button>
      </div>
    </header>
  );
}
