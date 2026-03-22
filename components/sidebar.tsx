"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EventFeed } from "@/components/feed/event-feed";
import { MentionsFeed } from "@/components/mentions/mentions-feed";
import {
  RadioTower,
  Quote,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type Tab = "signals" | "mentions";

export function Sidebar() {
  const [activeTab, setActiveTab] = useState<Tab>("signals");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const tabs = [
    { id: "signals" as Tab, label: "Signals", icon: RadioTower },
    { id: "mentions" as Tab, label: "Mentions", icon: Quote },
  ];

  return (
    <div
      className={cn(
        "relative flex h-full flex-col border-l border-border bg-card transition-all duration-300",
        isCollapsed ? "w-12" : "w-96"
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute -left-3 top-4 z-10 h-6 w-6 rounded-full border border-border bg-card"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <ChevronLeft className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
      </Button>

      {!isCollapsed && (
        <>
          <div className="flex border-b border-border">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition-colors",
                  activeTab === tab.id
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1 overflow-hidden">
            {activeTab === "signals" && <EventFeed />}
            {activeTab === "mentions" && <MentionsFeed />}
          </div>
        </>
      )}

      {isCollapsed && (
        <div className="flex flex-col items-center gap-2 pt-12">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              size="icon"
              onClick={() => {
                setActiveTab(tab.id);
                setIsCollapsed(false);
              }}
              className={cn(
                "h-8 w-8",
                activeTab === tab.id && "bg-primary/20 text-primary"
              )}
            >
              <tab.icon className="h-4 w-4" />
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
