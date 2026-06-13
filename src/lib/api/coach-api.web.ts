import { submitCheckIn } from "./checkin.functions";
import { storeFeedback } from "./feedback.functions";
import type { CoachApi } from "./coach-api";
import { createOrGetProfile } from "./profile.functions";
import { generateQuest } from "./quest.functions";

export function createCoachWebClient(): CoachApi {
  return {
    createOrGetProfile: (profileId) => createOrGetProfile({ data: { profileId } }),
    submitCheckIn: (input) => submitCheckIn({ data: input }),
    generateQuest: (input) => generateQuest({ data: input }),
    storeFeedback: (input) => storeFeedback({ data: input }),
  };
}
