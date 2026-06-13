import type { CheckIn, Feedback, QuestRecommendation, UserProfile } from "@/types/coach";

const MOOD_LABELS: Record<CheckIn["mood"], string> = {
  curious: "curious and open to discovery",
  focused: "focused and ready to go deep",
  playful: "playful and experimental",
  tired: "tired and low on bandwidth",
  inspired: "inspired and energized",
  restless: "restless and craving stimulation",
};

export function buildQuestPrompt(input: {
  checkIn: CheckIn;
  profile: UserProfile;
  recentQuests: QuestRecommendation[];
  recentFeedback: Feedback[];
}): string {
  const { checkIn, profile, recentQuests, recentFeedback } = input;
  const topicList = checkIn.topics.join(", ");

  const recentQuestLines =
    recentQuests.length > 0
      ? recentQuests.map((q) => `- "${q.title}" (${q.primaryTopic}, ${q.tag})`).join("\n")
      : "- None yet — this is their first quest.";

  const feedbackLines =
    recentFeedback.length > 0
      ? recentFeedback
          .map((f) => `- Rating ${f.rating}/5, completed: ${f.completed}${f.notes ? `, note: "${f.notes}"` : ""}`)
          .join("\n")
      : "- No prior feedback.";

  return `You are Curiosity Coach, a weekly learning quest designer for curious adults.

Design ONE personalized micro-quest (15–30 min) based on the user's check-in.

## User profile
- Streak: ${profile.streak} days
- Total quests completed: ${profile.totalQuests}
- XP: ${profile.xp}

## This week's check-in
- Mood: ${checkIn.mood} (${MOOD_LABELS[checkIn.mood]})
- Energy level: ${checkIn.energy}/100
- Progress on last quest: ${checkIn.progress}/100
- Topics of interest: ${topicList}

## Recent quests (avoid repeating)
${recentQuestLines}

## Recent feedback
${feedbackLines}

## Rules
1. Match difficulty to energy and mood — low energy or tired mood = shorter, gentler quest.
2. High energy or restless mood = more ambitious or hands-on.
3. Weave in at least one selected topic; prioritize the first topic.
4. Be specific and actionable — no vague "learn about X".
5. Title: punchy, under 8 words. Description: 1–2 sentences, concrete steps.
6. time: realistic estimate like "15 min" or "20 min".
7. tag: a short category label like "Micro deep-dive" or "Field study".

Respond with ONLY valid JSON matching this shape:
{"title":"...","desc":"...","time":"...","tag":"..."}`;
}
