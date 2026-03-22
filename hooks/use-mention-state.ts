"use client";

import { useCallback, useEffect, useState } from "react";

interface MentionAlertPreferences {
  spikeThreshold: number;
  showHighPriority: boolean;
  showSpikes: boolean;
}

interface MentionState {
  reviewedUrls: string[];
  savedUrls: string[];
  alertPreferences: MentionAlertPreferences;
}

const DEFAULT_STATE: MentionState = {
  reviewedUrls: [],
  savedUrls: [],
  alertPreferences: {
    spikeThreshold: 2,
    showHighPriority: true,
    showSpikes: true,
  },
};

export function useMentionState() {
  const [state, setState] = useState<MentionState>(DEFAULT_STATE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/mentions/state")
      .then((res) => res.json())
      .then((data) => setState(data))
      .catch(() => setState(DEFAULT_STATE))
      .finally(() => setIsLoading(false));
  }, []);

  const persist = useCallback(async (nextState: MentionState) => {
    setState(nextState);

    await fetch("/api/mentions/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nextState),
    });
  }, []);

  const toggleReviewed = useCallback(
    async (url: string) => {
      const nextReviewed = state.reviewedUrls.includes(url)
        ? state.reviewedUrls.filter((item) => item !== url)
        : [...state.reviewedUrls, url];

      await persist({
        ...state,
        reviewedUrls: nextReviewed,
      });
    },
    [persist, state]
  );

  const toggleSaved = useCallback(
    async (url: string) => {
      const nextSaved = state.savedUrls.includes(url)
        ? state.savedUrls.filter((item) => item !== url)
        : [...state.savedUrls, url];

      await persist({
        ...state,
        savedUrls: nextSaved,
      });
    },
    [persist, state]
  );

  const updateAlertPreferences = useCallback(
    async (alertPreferences: MentionAlertPreferences) => {
      await persist({
        ...state,
        alertPreferences,
      });
    },
    [persist, state]
  );

  return {
    ...state,
    isLoading,
    toggleReviewed,
    toggleSaved,
    updateAlertPreferences,
  };
}
