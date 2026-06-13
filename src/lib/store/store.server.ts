import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import type { CheckIn, Feedback, QuestRecommendation, UserProfile } from "@/types/coach";

interface DataStore {
  profiles: Record<string, UserProfile>;
  checkIns: Record<string, CheckIn>;
  quests: Record<string, QuestRecommendation>;
  feedback: Record<string, Feedback>;
}

const EMPTY_STORE: DataStore = {
  profiles: {},
  checkIns: {},
  quests: {},
  feedback: {},
};

let memoryStore: DataStore = structuredClone(EMPTY_STORE);
let storePath: string | null = null;

function getStorePath() {
  if (!storePath) {
    storePath = join(process.cwd(), ".data", "coach-store.json");
  }
  return storePath;
}

async function readStore(): Promise<DataStore> {
  try {
    const raw = await readFile(getStorePath(), "utf-8");
    return JSON.parse(raw) as DataStore;
  } catch {
    return structuredClone(memoryStore);
  }
}

async function writeStore(store: DataStore): Promise<void> {
  memoryStore = store;
  try {
    const path = getStorePath();
    await mkdir(join(process.cwd(), ".data"), { recursive: true });
    await writeFile(path, JSON.stringify(store, null, 2), "utf-8");
  } catch {
    // File writes unavailable (e.g. Cloudflare Workers) — in-memory only.
  }
}

export async function getOrCreateProfile(profileId: string): Promise<UserProfile> {
  const store = await readStore();
  const existing = store.profiles[profileId];
  if (existing) return existing;

  const profile: UserProfile = {
    id: profileId,
    createdAt: new Date().toISOString(),
    lastCheckInAt: null,
    streak: 0,
    totalQuests: 0,
    xp: 0,
  };

  store.profiles[profileId] = profile;
  await writeStore(store);
  return profile;
}

export async function getProfile(profileId: string): Promise<UserProfile | null> {
  const store = await readStore();
  return store.profiles[profileId] ?? null;
}

export async function saveCheckIn(checkIn: CheckIn): Promise<CheckIn> {
  const store = await readStore();
  store.checkIns[checkIn.id] = checkIn;

  const profile = store.profiles[checkIn.profileId];
  if (profile) {
    profile.lastCheckInAt = checkIn.createdAt;
    store.profiles[checkIn.profileId] = profile;
  }

  await writeStore(store);
  return checkIn;
}

export async function getCheckIn(checkInId: string): Promise<CheckIn | null> {
  const store = await readStore();
  return store.checkIns[checkInId] ?? null;
}

export async function saveQuest(quest: QuestRecommendation): Promise<QuestRecommendation> {
  const store = await readStore();
  store.quests[quest.id] = quest;

  const profile = store.profiles[quest.profileId];
  if (profile) {
    profile.totalQuests += 1;
    store.profiles[quest.profileId] = profile;
  }

  await writeStore(store);
  return quest;
}

export async function getQuest(questId: string): Promise<QuestRecommendation | null> {
  const store = await readStore();
  return store.quests[questId] ?? null;
}

export async function saveFeedbackRecord(feedback: Feedback): Promise<{
  feedback: Feedback;
  profile: UserProfile;
}> {
  const store = await readStore();
  store.feedback[feedback.id] = feedback;

  const profile = store.profiles[feedback.profileId];
  if (!profile) {
    throw new Error("Profile not found");
  }

  const xpGain = feedback.completed ? 120 + feedback.rating * 10 : feedback.rating * 5;
  profile.xp += xpGain;

  if (feedback.completed) {
    const lastCheckIn = profile.lastCheckInAt ? new Date(profile.lastCheckInAt) : null;
    const now = new Date(feedback.createdAt);
    const withinStreakWindow =
      lastCheckIn !== null && now.getTime() - lastCheckIn.getTime() <= 8 * 24 * 60 * 60 * 1000;
    profile.streak = withinStreakWindow ? profile.streak + 1 : 1;
  }

  store.profiles[feedback.profileId] = profile;
  await writeStore(store);

  return { feedback, profile };
}

export async function getRecentQuestsForProfile(
  profileId: string,
  limit = 3
): Promise<QuestRecommendation[]> {
  const store = await readStore();
  return Object.values(store.quests)
    .filter((q) => q.profileId === profileId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

export async function getRecentFeedbackForProfile(
  profileId: string,
  limit = 3
): Promise<Feedback[]> {
  const store = await readStore();
  return Object.values(store.feedback)
    .filter((f) => f.profileId === profileId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}
