/// <reference types="chrome" />
import type { CoachApi } from "./coach-api";
import type { CheckIn, Feedback, QuestRecommendation, UserProfile } from "@/types/coach";

// ── Helper to send messages to background ────────────────────────
async function sendMessage<T>(type: string, payload?: unknown): Promise<T> {
  const response = await chrome.runtime.sendMessage({ type, payload });
  if (response?.error) throw new Error(response.error);
  return response as T;
}

// ── Extension implementation of CoachApi ─────────────────────────
export function createCoachExtensionClient(): CoachApi {
  return {
    createOrGetProfile: (_profileId: string) =>
      sendMessage<UserProfile>("GET_PROFILE"),

    submitCheckIn: (input) =>
      sendMessage<CheckIn>("SUBMIT_CHECKIN", input),

    generateQuest: (input) =>
      sendMessage<QuestRecommendation>("GENERATE_QUEST", input),

    storeFeedback: (input) =>
      sendMessage<{ feedback: Feedback; profile: UserProfile }>("STORE_FEEDBACK", input),
  };
}

// ── Active quest helpers (used directly in CuriosityCoach) ───────
export async function getActiveQuest(): Promise<{ quest: QuestRecommendation; assignedAt: string } | null> {
  const response = await chrome.runtime.sendMessage({ type: "GET_ACTIVE_QUEST" });
  if (response?.error) throw new Error(response.error);
  return response;
}

export async function clearActiveQuest(): Promise<void> {
  await chrome.runtime.sendMessage({ type: "CLEAR_ACTIVE_QUEST" });
}