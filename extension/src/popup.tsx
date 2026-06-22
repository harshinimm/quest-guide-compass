import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import { CuriosityCoach } from "@/components/CuriosityCoach";
import { createCoachExtensionClient } from "@/lib/api/coach-api.extension";
// @ts-ignore: allow side-effect import of CSS in this build environment
import "../../src/styles.css";

const queryClient = new QueryClient();
const coachApi = createCoachExtensionClient();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <CuriosityCoach api={coachApi} />
  </QueryClientProvider>
);