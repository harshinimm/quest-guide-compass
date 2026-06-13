import { z } from "zod";

import {
  coachCreateOrGetProfile,
  coachGenerateQuest,
  coachStoreFeedback,
  coachSubmitCheckIn,
} from "@/lib/coach/service.server";
import { getServerConfig } from "@/lib/config.server";
import { moodSchema, topicSchema } from "@/types/coach";

const profileBody = z.object({ profileId: z.string().uuid() });
const checkInBody = z.object({
  profileId: z.string().uuid(),
  mood: moodSchema,
  energy: z.number().int().min(0).max(100),
  progress: z.number().int().min(0).max(100),
  topics: z.array(topicSchema).min(1).max(3),
});
const questBody = z.object({
  profileId: z.string().uuid(),
  checkInId: z.string().uuid(),
});
const feedbackBody = z.object({
  profileId: z.string().uuid(),
  questId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  completed: z.boolean(),
  notes: z.string().max(500).optional(),
});

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true;
  if (origin.startsWith("chrome-extension://")) return true;
  const { corsOrigins } = getServerConfig();
  return corsOrigins.includes(origin) || corsOrigins.includes("*");
}

function corsHeaders(request: Request): HeadersInit {
  const origin = request.headers.get("Origin");
  const allowOrigin = origin && isAllowedOrigin(origin) ? origin : "null";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

function jsonResponse(request: Request, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(request),
    },
  });
}

async function readJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function handleCoachRestApi(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/api/coach/")) return null;

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(request) });
  }

  if (request.method !== "POST") {
    return jsonResponse(request, { error: "Method not allowed" }, 405);
  }

  try {
    const body = await readJson(request);

    switch (url.pathname) {
      case "/api/coach/profile": {
        const data = profileBody.parse(body);
        return jsonResponse(request, await coachCreateOrGetProfile(data.profileId));
      }
      case "/api/coach/check-in": {
        const data = checkInBody.parse(body);
        return jsonResponse(request, await coachSubmitCheckIn(data));
      }
      case "/api/coach/quest": {
        const data = questBody.parse(body);
        return jsonResponse(request, await coachGenerateQuest(data));
      }
      case "/api/coach/feedback": {
        const data = feedbackBody.parse(body);
        return jsonResponse(request, await coachStoreFeedback(data));
      }
      default:
        return jsonResponse(request, { error: "Not found" }, 404);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Request failed";
    return jsonResponse(request, { error: message }, 400);
  }
}
