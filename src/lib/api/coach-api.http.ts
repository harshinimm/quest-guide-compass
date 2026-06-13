import type { CoachApi } from "./coach-api";

function getApiBaseUrl(): string {
  const base = import.meta.env.VITE_COACH_API_URL;
  if (!base) {
    throw new Error("VITE_COACH_API_URL is not set for the extension build.");
  }
  return base.replace(/\/$/, "");
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const payload = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(payload.error ?? `API request failed (${response.status})`);
  }

  return payload;
}

export function createCoachHttpClient(): CoachApi {
  return {
    createOrGetProfile: (profileId) => post("/api/coach/profile", { profileId }),
    submitCheckIn: (input) => post("/api/coach/check-in", input),
    generateQuest: (input) => post("/api/coach/quest", input),
    storeFeedback: (input) => post("/api/coach/feedback", input),
  };
}
