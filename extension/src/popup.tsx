import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";

import { CuriosityCoach } from "@/components/CuriosityCoach";
import { createCoachHttpClient } from "@/lib/api/coach-api.http";
import "@/styles.css";

const queryClient = new QueryClient();
const coachApi = createCoachHttpClient();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <CuriosityCoach api={coachApi} />
  </QueryClientProvider>
);
