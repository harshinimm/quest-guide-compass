import type { CheckIn, Feedback, Mood, QuestRecommendation, Topic, UserProfile } from "@/types/coach";

export interface CoachApi {
  createOrGetProfile(profileId: string): Promise<UserProfile>;
  submitCheckIn(input: {
    profileId: string;
    mood: Mood;
    energy: number;
    progress: number;
    topics: Topic[];
  }): Promise<CheckIn>;
  generateQuest(input: { profileId: string; checkInId: string }): Promise<QuestRecommendation>;
  storeFeedback(input: {
    profileId: string;
    questId: string;
    rating: number;
    completed: boolean;
    notes?: string;
  }): Promise<{ feedback: Feedback; profile: UserProfile }>;
}

export function isExtensionRuntime(): boolean {
  return import.meta.env.VITE_COACH_RUNTIME === "extension";
}
