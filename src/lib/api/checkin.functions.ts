import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { coachSubmitCheckIn } from "../coach/service.server";
import { moodSchema, topicSchema } from "@/types/coach";

export const submitCheckIn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      profileId: z.string().uuid(),
      mood: moodSchema,
      energy: z.number().int().min(0).max(100),
      progress: z.number().int().min(0).max(100),
      topics: z.array(topicSchema).min(1).max(3),
    })
  )
  .handler(async ({ data }) => coachSubmitCheckIn(data));
