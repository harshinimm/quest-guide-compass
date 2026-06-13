import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { coachCreateOrGetProfile } from "../coach/service.server";

export const createOrGetProfile = createServerFn({ method: "POST" })
  .validator(z.object({ profileId: z.string().uuid() }))
  .handler(async ({ data }) => coachCreateOrGetProfile(data.profileId));
