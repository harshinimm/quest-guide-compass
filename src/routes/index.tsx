import { createFileRoute } from "@tanstack/react-router";
import { CuriosityCoach } from "@/components/CuriosityCoach";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Curiosity Coach — Your Weekly Quest" },
      { name: "description", content: "A browser-extension-style coach that turns your weekly check-in into a personalized curiosity quest." },
      { property: "og:title", content: "Curiosity Coach — Your Weekly Quest" },
      { property: "og:description", content: "Check in, pick your topics, get a quest. Stay curious every week." },
    ],
  }),
  component: () => <CuriosityCoach />,
});
