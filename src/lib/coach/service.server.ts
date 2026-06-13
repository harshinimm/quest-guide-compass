import { pickFallbackQuest } from "@/lib/quests/fallback";
import { generateQuestFromLlm } from "@/lib/llm/client.server";
import { buildQuestPrompt } from "@/lib/llm/prompt.server";
import {
  getCheckIn,
  getOrCreateProfile,
  getQuest,
  getRecentFeedbackForProfile,
  getRecentQuestsForProfile,
  saveCheckIn,
  saveFeedbackRecord,
  saveQuest,
} from "@/lib/store/store.server";
import type { CheckIn, Mood, Topic, UserProfile } from "@/types/coach";

export async function coachCreateOrGetProfile(profileId: string): Promise<UserProfile> {
  return getOrCreateProfile(profileId);
}

export async function coachSubmitCheckIn(input: {
  profileId: string;
  mood: Mood;
  energy: number;
  progress: number;
  topics: Topic[];
}): Promise<CheckIn> {
  await getOrCreateProfile(input.profileId);

  const checkIn: CheckIn = {
    id: crypto.randomUUID(),
    profileId: input.profileId,
    mood: input.mood,
    energy: input.energy,
    progress: input.progress,
    topics: input.topics,
    createdAt: new Date().toISOString(),
  };

  return saveCheckIn(checkIn);
}

export async function coachGenerateQuest(input: {
  profileId: string;
  checkInId: string;
}) {
  const checkIn = await getCheckIn(input.checkInId);
  if (!checkIn || checkIn.profileId !== input.profileId) {
    throw new Error("Check-in not found");
  }

  const profile = await getOrCreateProfile(input.profileId);
  const recentQuests = await getRecentQuestsForProfile(input.profileId);
  const recentFeedback = await getRecentFeedbackForProfile(input.profileId);

  const prompt = buildQuestPrompt({ checkIn, profile, recentQuests, recentFeedback });
  const llmQuest = await generateQuestFromLlm(prompt);

  const primaryTopic = checkIn.topics[0] ?? "science";
  const fallback = pickFallbackQuest(checkIn);
  const questContent = llmQuest ?? fallback.quest;

  return saveQuest({
    id: crypto.randomUUID(),
    profileId: input.profileId,
    checkInId: input.checkInId,
    primaryTopic: llmQuest ? primaryTopic : fallback.primaryTopic,
    source: llmQuest ? "llm" : "fallback",
    createdAt: new Date().toISOString(),
    ...questContent,
  });
}

export async function coachStoreFeedback(input: {
  profileId: string;
  questId: string;
  rating: number;
  completed: boolean;
  notes?: string;
}) {
  const quest = await getQuest(input.questId);
  if (!quest || quest.profileId !== input.profileId) {
    throw new Error("Quest not found");
  }

  return saveFeedbackRecord({
    id: crypto.randomUUID(),
    profileId: input.profileId,
    questId: input.questId,
    rating: input.rating,
    completed: input.completed,
    notes: input.notes,
    createdAt: new Date().toISOString(),
  });
}
