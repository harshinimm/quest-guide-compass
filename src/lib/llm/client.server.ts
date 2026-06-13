import { questSchema } from "@/types/coach";
import type { Quest } from "@/types/coach";

import { getServerConfig } from "../config.server";

export async function generateQuestFromLlm(prompt: string): Promise<Quest | null> {
  const { openaiApiKey } = getServerConfig();
  if (!openaiApiKey) return null;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.8,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You output only valid JSON for curiosity coaching quests.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    console.error("LLM request failed:", response.status, await response.text());
    return null;
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = payload.choices?.[0]?.message?.content;
  if (!content) return null;

  try {
    const parsed = questSchema.parse(JSON.parse(content));
    return parsed;
  } catch (error) {
    console.error("Failed to parse LLM quest JSON:", error);
    return null;
  }
}
