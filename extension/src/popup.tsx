import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";

// Inlined shared types from src/types/coach.ts so this extension bundle
// does not depend on cross-folder type imports at build time.
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

// Minimal popup render — the real UI component is not imported here deliberately.
const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <div style={{ padding: 12, fontFamily: 'sans-serif' }}>Extension UI omitted in this build.</div>
  </QueryClientProvider>
);
