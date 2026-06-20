/// <reference types="chrome" />
import type { CoachApi } from "./coach-api";
// Inlined types from src/types/coach to avoid cross-folder type imports in builds
type Mood =
  | "curious"
  | "focused"
  | "playful"
  | "tired"
  | "inspired"
  | "restless";

type Topic =
  | "science"
  | "tech"
  | "space"
  | "art"
  | "nature"
  | "culture"
  | "music"
  | "history";

type Quest = {
  title: string;
  desc: string;
  time: string;
  tag: string;
};

type UserProfile = {
  id: string;
  createdAt: string;
  lastCheckInAt: string | null;
  streak: number;
  totalQuests: number;
  xp: number;
};

type CheckIn = {
  id: string;
  profileId: string;
  mood: Mood;
  energy: number;
  progress: number;
  topics: Topic[];
  createdAt: string;
};

type QuestRecommendation = Quest & {
  id: string;
  profileId: string;
  checkInId: string;
  primaryTopic: Topic;
  source: "llm" | "fallback";
  createdAt: string;
};

type Feedback = {
  id: string;
  profileId: string;
  questId: string;
  rating: number;
  completed: boolean;
  notes?: string;
  createdAt: string;
};

// ── Helper to send messages to background ────────────────────────
async function sendMessage<T>(type: string, payload?: unknown): Promise<T> {
  const response = await chrome.runtime.sendMessage({ type, payload });
  if (response?.error) throw new Error(response.error);
  return response as T;
}

// ── Extension implementation of CoachApi ─────────────────────────
export function createCoachExtensionClient(): CoachApi {
  return {
    // GET_PROFILE — reads or creates profile from chrome.storage.sync
    createOrGetProfile: (_profileId: string) =>
      sendMessage<UserProfile>("GET_PROFILE"),

    // SUBMIT_CHECKIN — saves check-in and updates streak
    submitCheckIn: (input) =>
      sendMessage<CheckIn>("SUBMIT_CHECKIN", input),

    // GENERATE_QUEST — calls Gemini and returns a quest
    generateQuest: (input) =>
      sendMessage<QuestRecommendation>("GENERATE_QUEST", input),

    // STORE_FEEDBACK — saves takeaways and updates XP
    storeFeedback: (input) =>
      sendMessage<{ feedback: Feedback; profile: UserProfile }>("STORE_FEEDBACK", input),
  };
}