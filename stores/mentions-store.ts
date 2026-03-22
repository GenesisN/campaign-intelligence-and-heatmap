import { create } from "zustand";
import type { CampaignMention } from "@/types";

interface MentionsState {
  mentions: CampaignMention[];
  isLoading: boolean;
  error: string | null;
  setMentions: (mentions: CampaignMention[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useMentionsStore = create<MentionsState>((set) => ({
  mentions: [],
  isLoading: false,
  error: null,
  setMentions: (mentions) => set({ mentions }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
