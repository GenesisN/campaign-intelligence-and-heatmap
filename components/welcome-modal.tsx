"use client";

import { useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Map, Rss, Globe, Flame, Filter } from "lucide-react";

const WELCOME_DISMISSED_KEY = "greenpeace_africa_intelligence_welcome_dismissed";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const features: Feature[] = [
  {
    icon: <Map className="h-6 w-6" />,
    title: "Africa Heatmap",
    description:
      "Track where campaign pressure is rising across Africa using a simple heatmap and signal markers.",
    color: "text-red-500",
  },
  {
    icon: <Rss className="h-6 w-6" />,
    title: "Signals Feed",
    description:
      "Browse live campaign developments across oceans, water, biodiversity, forests, climate and energy, plastics, oil and gas, and food sovereignty.",
    color: "text-orange-500",
  },
  {
    icon: <Globe className="h-6 w-6" />,
    title: "Africa-First Monitoring",
    description:
      "The monitor starts centered on Africa and prioritizes country-level developments relevant to Greenpeace Africa.",
    color: "text-blue-500",
  },
  {
    icon: <Filter className="h-6 w-6" />,
    title: "Simple Filters",
    description:
      "Filter quickly by campaign area and priority without turning the interface into a complex analyst workstation.",
    color: "text-purple-500",
  },
  {
    icon: <Flame className="h-6 w-6" />,
    title: "Signal Priority",
    description:
      "Critical, high, medium, low, and watch levels help separate urgent campaign developments from background monitoring.",
    color: "text-green-500",
  },
];

interface WelcomeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WelcomeModal({ open, onOpenChange }: WelcomeModalProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem(WELCOME_DISMISSED_KEY, "true");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onClose={handleClose} className="max-w-3xl">
      <DialogHeader onClose={handleClose}>
        <DialogTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          Welcome to Greenpeace Africa Intelligence
        </DialogTitle>
      </DialogHeader>

      <DialogContent className="max-h-[60vh]">
        <p className="mb-6 text-muted-foreground">
          Your Phase 1 campaign monitoring workspace for tracking Africa-focused
          environmental developments and campaign signals.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-lg border border-border bg-muted/30 p-4 transition-colors hover:bg-muted/50"
            >
              <div className="mb-2 flex items-center gap-3">
                <div className={feature.color}>{feature.icon}</div>
                <h3 className="font-medium text-foreground">{feature.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </DialogContent>

      <DialogFooter className="flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
            className="h-4 w-4 rounded border-border bg-background accent-primary"
          />
          Don&apos;t show this again
        </label>
        <Button onClick={handleClose}>Open Workspace</Button>
      </DialogFooter>
    </Dialog>
  );
}
