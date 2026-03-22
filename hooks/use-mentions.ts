"use client";

import { useCallback, useEffect, useRef } from "react";
import { useMentionsStore } from "@/stores/mentions-store";
import { useAuthStore } from "@/stores/auth-store";
import type { CampaignMention } from "@/types";
import type { MentionTarget } from "@/lib/greenpeace-config";

const APP_MODE = process.env.NEXT_PUBLIC_APP_MODE || "self-hosted";

interface UseMentionsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  targets?: MentionTarget[];
}

export function useMentions(options: UseMentionsOptions = {}) {
  const { autoRefresh = true, refreshInterval = 600000, targets = [] } = options;
  const { mentions, isLoading, error, setMentions, setLoading, setError } =
    useMentionsStore();
  const { getAccessToken, isAuthenticated } = useAuthStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const serializedTargets = JSON.stringify(targets);

  const requiresAuth = APP_MODE === "valyu";

  const fetchMentions = useCallback(async () => {
    if (requiresAuth && !isAuthenticated) {
      setMentions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const accessToken = getAccessToken();
      const response = await fetch("/api/mentions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken, targets }),
      });

      const data = await response.json();

      if (response.status === 401 || data.requiresReauth) {
        setError("Please wait 30 seconds and refresh.");
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch mentions");
      }

      setMentions((data.mentions || []) as CampaignMention[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  }, [
    getAccessToken,
    isAuthenticated,
    requiresAuth,
    serializedTargets,
    setError,
    setLoading,
    setMentions,
    targets,
  ]);

  useEffect(() => {
    fetchMentions();
  }, [fetchMentions]);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (autoRefresh && (!requiresAuth || isAuthenticated)) {
      intervalRef.current = setInterval(fetchMentions, refreshInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, fetchMentions, isAuthenticated, refreshInterval, requiresAuth]);

  return {
    mentions,
    isLoading,
    error,
    refresh: fetchMentions,
  };
}
