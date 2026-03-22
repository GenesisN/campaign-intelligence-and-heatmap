"use client";

import { useMapStore } from "@/stores/map-store";
import { Flame, MapPinned } from "lucide-react";

export function MapControls() {
  const { showHeatmap, showClusters, toggleHeatmap, toggleClusters } =
    useMapStore();

  return (
    <div className="absolute bottom-6 left-6 z-10 flex flex-col gap-3">
      <button
        onClick={toggleHeatmap}
        className={`flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all duration-200 ${
          showHeatmap
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "bg-card/95 text-foreground hover:bg-card border border-border"
        } backdrop-blur-sm`}
        title={showHeatmap ? "Hide heatmap" : "Show heatmap"}
      >
        <Flame className="h-5 w-5" />
      </button>

      <button
        onClick={toggleClusters}
        className={`flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all duration-200 ${
          showClusters
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "bg-card/95 text-foreground hover:bg-card border border-border"
        } backdrop-blur-sm`}
        title={showClusters ? "Hide markers" : "Show markers"}
      >
        <MapPinned className="h-5 w-5" />
      </button>
    </div>
  );
}
