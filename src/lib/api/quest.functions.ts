import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { coachGenerateQuest } from "../coach/service.server";

export const generateQuest = createServerFn({ method: "POST" })
  .validator(
    z.object({
      profileId: z.string().uuid(),
      checkInId: z.string().uuid(),
    })
  )
  .handler(async ({ data }) => coachGenerateQuest(data));
