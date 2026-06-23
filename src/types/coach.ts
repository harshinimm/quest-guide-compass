import { z } from "zod";

export const moodSchema = z.enum([
  "curious",
  "focused",
  "playful",
  "tired",
  "inspired",
  "restless",
]);

export const topicSchema = z.enum([
  "science",
  "tech",
  "space",
  "art",
  "nature",
  "culture",
  "music",
  "history",
  "economics",
  "literature",
  "philosophy",
  "psychology",
]);

export const questSchema = z.object({
  title: z.string().min(1),
  desc: z.string().min(1),
  time: z.string().min(1),
  tag: z.string().min(1),
  articles: z.array(z.object({
    title: z.string(),
    url: z.string(),
  })).optional(),
});

export const userProfileSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  lastCheckInAt: z.string().datetime().nullable(),
  streak: z.number().int().min(0),
  totalQuests: z.number().int().min(0),
  xp: z.number().int().min(0),
});

export const checkInSchema = z.object({
  id: z.string().uuid(),
  profileId: z.string().uuid(),
  mood: moodSchema,
  energy: z.number().int().min(0).max(100),
  progress: z.number().int().min(0).max(100),
  topics: z.array(topicSchema).min(1).max(3),
  createdAt: z.string().datetime(),
});

export const questRecommendationSchema = questSchema.extend({
  id: z.string().uuid(),
  profileId: z.string().uuid(),
  checkInId: z.string().uuid(),
  primaryTopic: topicSchema,
  source: z.enum(["llm", "fallback"]),
  createdAt: z.string().datetime(),
});

export const feedbackSchema = z.object({
  id: z.string().uuid(),
  profileId: z.string().uuid(),
  questId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  completed: z.boolean(),
  notes: z.string().max(500).optional(),
  createdAt: z.string().datetime(),
});

export type Mood = z.infer<typeof moodSchema>;
export type Topic = z.infer<typeof topicSchema>;
export type Quest = z.infer<typeof questSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
export type CheckIn = z.infer<typeof checkInSchema>;
export type QuestRecommendation = z.infer<typeof questRecommendationSchema>;
export type Feedback = z.infer<typeof feedbackSchema>;