/// <reference types="chrome" />
import { z } from "zod";

const moodSchema = z.enum([
  "curious",
  "focused",
  "playful",
  "tired",
  "inspired",
  "restless",
]);

const topicSchema = z.enum([
  "science",
  "tech",
  "space",
  "art",
  "nature",
  "culture",
  "music",
  "history",
]);

const questSchema = z.object({
  title: z.string().min(1),
  desc: z.string().min(1),
  time: z.string().min(1),
  tag: z.string().min(1),
});

const userProfileSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  lastCheckInAt: z.string().datetime().nullable(),
  streak: z.number().int().min(0),
  totalQuests: z.number().int().min(0),
  xp: z.number().int().min(0),
});

const checkInSchema = z.object({
  id: z.string().uuid(),
  profileId: z.string().uuid(),
  mood: moodSchema,
  energy: z.number().int().min(0).max(100),
  progress: z.number().int().min(0).max(100),
  topics: z.array(topicSchema).min(1).max(3),
  createdAt: z.string().datetime(),
});

const questRecommendationSchema = questSchema.extend({
  id: z.string().uuid(),
  profileId: z.string().uuid(),
  checkInId: z.string().uuid(),
  primaryTopic: topicSchema,
  source: z.enum(["llm", "fallback"]),
  createdAt: z.string().datetime(),
});

const feedbackSchema = z.object({
  id: z.string().uuid(),
  profileId: z.string().uuid(),
  questId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  completed: z.boolean(),
  notes: z.string().max(500).optional(),
  createdAt: z.string().datetime(),
});

type UserProfile = z.infer<typeof userProfileSchema>;
type CheckIn = z.infer<typeof checkInSchema>;
type QuestRecommendation = z.infer<typeof questRecommendationSchema>;
type Feedback = z.infer<typeof feedbackSchema>;

// ── Storage types ────────────────────────────────────────────────
type StorageData = {
  apiKey?: string;
  profile?: UserProfile;
  checkins?: CheckIn[];
  quests?: QuestRecommendation[];
  feedbacks?: Feedback[];
};

// ── Storage helpers ──────────────────────────────────────────────
async function storageGet<K extends keyof StorageData>(
  keys: K[]
): Promise<Pick<StorageData, K>> {
  return new Promise((resolve) =>
    chrome.storage.sync.get(keys, (result) => resolve(result as Pick<StorageData, K>))
  );
}

async function storageSet(data: Partial<StorageData>): Promise<void> {
  return new Promise((resolve) => chrome.storage.sync.set(data, resolve));
}

// ── Weekly alarm ─────────────────────────────────────────────────
const WEEKLY_ALARM = "weekly-checkin";

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create(WEEKLY_ALARM, {
    periodInMinutes: 7 * 24 * 60,
    delayInMinutes: 7 * 24 * 60,
  });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name !== WEEKLY_ALARM) return;
  chrome.notifications.create("weekly-checkin", {
    type: "basic",
    iconUrl: chrome.runtime.getURL("icons/icon128.png"),
    title: "Curiosity Coach",
    message: "Time for your weekly check-in. What are you curious about this week?",
    priority: 1,
  });
});

// ── Message listener ─────────────────────────────────────────────
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  handleMessage(request).then(sendResponse).catch((err) => {
    sendResponse({ error: err.message ?? "Unknown error" });
  });
  return true;
});

async function handleMessage(request: { type: string; payload?: unknown }) {
  switch (request.type) {
    case "GET_PROFILE":    return handleGetProfile();
    case "SUBMIT_CHECKIN": return handleSubmitCheckIn(request.payload);
    case "GENERATE_QUEST": return handleGenerateQuest(request.payload);
    case "STORE_FEEDBACK": return handleStoreFeedback(request.payload);
    default: throw new Error(`Unknown message type: ${request.type}`);
  }
}

// ── GET_PROFILE ──────────────────────────────────────────────────
async function handleGetProfile(): Promise<UserProfile> {
  const { profile } = await storageGet(["profile"]);
  if (profile) return profile;

  const newProfile: UserProfile = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    lastCheckInAt: null,
    streak: 0,
    totalQuests: 0,
    xp: 0,
  };
  await storageSet({ profile: newProfile });
  return newProfile;
}

// ── SUBMIT_CHECKIN ───────────────────────────────────────────────
async function handleSubmitCheckIn(payload: unknown): Promise<CheckIn> {
  const input = payload as {
    profileId: string;
    mood: string;
    energy: number;
    progress: number;
    topics: string[];
  };

  const { profile, checkins = [] } = await storageGet(["profile", "checkins"]);
  if (!profile) throw new Error("Profile not found");

  const newCheckIn: CheckIn = {
    id: crypto.randomUUID(),
    profileId: input.profileId,
    mood: input.mood as CheckIn["mood"],
    energy: input.energy,
    progress: input.progress,
    topics: input.topics as CheckIn["topics"],
    createdAt: new Date().toISOString(),
  };

  const now = new Date();
  const last = profile.lastCheckInAt ? new Date(profile.lastCheckInAt) : null;
  const daysSinceLast = last
    ? Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const newStreak =
    daysSinceLast === null ? 1
    : daysSinceLast <= 1   ? profile.streak + 1
    : 1;

  const updatedProfile: UserProfile = {
    ...profile,
    lastCheckInAt: newCheckIn.createdAt,
    streak: newStreak,
  };

  const updatedCheckins = [newCheckIn, ...checkins].slice(0, 10);
  await storageSet({ profile: updatedProfile, checkins: updatedCheckins });
  return newCheckIn;
}

// ── GENERATE_QUEST ───────────────────────────────────────────────
async function handleGenerateQuest(payload: unknown): Promise<QuestRecommendation> {
  const { profileId, checkInId } = payload as { profileId: string; checkInId: string };

  const { apiKey, checkins = [], feedbacks = [] } = await storageGet([
    "apiKey",
    "checkins",
    "feedbacks",
  ]);
  if (!apiKey) throw new Error("No Groq API key found. Please set it in Settings.");

  const currentCheckIn = checkins.find((c) => c.id === checkInId);
  if (!currentCheckIn) throw new Error("Check-in not found");

  const recentCheckIns = checkins.slice(0, 3);
  const recentFeedbacks = feedbacks.slice(0, 3);

  const prompt = `
You are a personal growth and learning agent. Based on the user's check-in history and past feedback, 
generate a personalized quest for them to do this week.

CURRENT CHECK-IN:
- Mood: ${currentCheckIn.mood}
- Energy level: ${currentCheckIn.energy}%
- Progress on last quest: ${currentCheckIn.progress}%
- Topics of interest: ${currentCheckIn.topics.join(", ")}

RECENT CHECK-IN HISTORY:
${recentCheckIns.map((c, i) => `${i + 1}. Mood: ${c.mood}, Energy: ${c.energy}%, Topics: ${c.topics.join(", ")}`).join("\n")}

RECENT FEEDBACK & TAKEAWAYS:
${recentFeedbacks.length === 0
    ? "No previous feedback yet — this is their first quest."
    : recentFeedbacks.map((f, i) => `${i + 1}. Rating: ${f.rating}/5, Completed: ${f.completed}, Notes: ${f.notes ?? "none"}`).join("\n")}

Based on this, choose the best topic for their growth right now and generate a quest.
The quest should include:
- A specific article search query they should look up (not a generic topic, an actual search string)
- A journal prompt to reflect on what they learn
- An estimated time commitment

Respond ONLY with a valid JSON object in this exact shape, no markdown, no explanation:
{
  "title": "short compelling quest title",
  "desc": "2-3 sentences describing what to do — include the exact search query to use and the journal prompt",
  "time": "e.g. 20 mins",
  "tag": "one word category",
  "primaryTopic": "one of: science, tech, space, art, nature, culture, music, history"
}
`.trim();

  const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 512,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err?.error?.message ?? `Groq API error ${response.status}`);
  }

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content ?? "";
  const parsed = JSON.parse(raw);
  const validated = questSchema.parse(parsed);
  const primaryTopic = (parsed as { primaryTopic: string }).primaryTopic;

  const quest: QuestRecommendation = {
    id: crypto.randomUUID(),
    profileId,
    checkInId,
    title: validated.title,
    desc: validated.desc,
    time: validated.time,
    tag: validated.tag,
    primaryTopic: primaryTopic as QuestRecommendation["primaryTopic"],
    source: "llm",
    createdAt: new Date().toISOString(),
  };

  const { quests = [] } = await storageGet(["quests"]);
  await storageSet({ quests: [quest, ...quests].slice(0, 10) });

  return quest;
}

// ── STORE_FEEDBACK ───────────────────────────────────────────────
async function handleStoreFeedback(payload: unknown): Promise<{ feedback: Feedback; profile: UserProfile }> {
  const input = payload as {
    profileId: string;
    questId: string;
    rating: number;
    completed: boolean;
    notes?: string;
  };

  const { profile, feedbacks = [] } = await storageGet(["profile", "feedbacks"]);
  if (!profile) throw new Error("Profile not found");

  const newFeedback: Feedback = {
    id: crypto.randomUUID(),
    profileId: input.profileId,
    questId: input.questId,
    rating: input.rating,
    completed: input.completed,
    notes: input.notes,
    createdAt: new Date().toISOString(),
  };

  const xpEarned =
    100 +
    (input.completed ? 50 : 0) +
    (input.rating >= 4 ? 25 : 0);

  const updatedProfile: UserProfile = {
    ...profile,
    totalQuests: profile.totalQuests + 1,
    xp: profile.xp + xpEarned,
  };

  const updatedFeedbacks = [newFeedback, ...feedbacks].slice(0, 10);
  await storageSet({ profile: updatedProfile, feedbacks: updatedFeedbacks });

  return { feedback: newFeedback, profile: updatedProfile };
}