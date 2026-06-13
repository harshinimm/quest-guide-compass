import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { coachStoreFeedback } from "../coach/service.server";

export const storeFeedback = createServerFn({ method: "POST" })
  .validator(
    z.object({
      profileId: z.string().uuid(),
      questId: z.string().uuid(),
      rating: z.number().int().min(1).max(5),
      completed: z.boolean(),
      notes: z.string().max(500).optional(),
    })
  )
  .handler(async ({ data }) => coachStoreFeedback(data));
