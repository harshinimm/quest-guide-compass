import type { CheckIn, Quest, Topic } from "@/types/coach";

export const FALLBACK_QUESTS: Record<Topic, Quest> = {
  science: {
    title: "Decode a single cell",
    desc: "Spend 15 minutes mapping how a mitochondrion turns food into the energy reading these words.",
    time: "15 min",
    tag: "Micro deep-dive",
  },
  tech: {
    title: "Reverse-engineer a daily app",
    desc: "Pick one app you opened today and sketch the 3 systems that make it feel instant.",
    time: "20 min",
    tag: "Builder's eye",
  },
  space: {
    title: "Find your cosmic address",
    desc: "Trace your location from your chair → Earth → solar system → local arm of the galaxy.",
    time: "10 min",
    tag: "Perspective shift",
  },
  art: {
    title: "Steal like a curator",
    desc: "Collect 5 images that share one invisible quality. Name the quality in a single word.",
    time: "25 min",
    tag: "Pattern hunt",
  },
  nature: {
    title: "Notice one tree",
    desc: "Find a tree near you. Learn its name, its age range, and what visits it this season.",
    time: "15 min",
    tag: "Field study",
  },
  culture: {
    title: "Borrow a worldview",
    desc: "Read one short essay from a culture you know little about. Note one belief that surprised you.",
    time: "20 min",
    tag: "Empathy rep",
  },
  music: {
    title: "Hear a song's skeleton",
    desc: "Pick a favorite track. Listen 3 times, each focused on bass, rhythm, or melody only.",
    time: "12 min",
    tag: "Active listening",
  },
  history: {
    title: "Time-travel to a Tuesday",
    desc: "Pick a year. Discover what an ordinary Tuesday looked like for a regular person living then.",
    time: "20 min",
    tag: "Story dive",
  },
};

export function pickFallbackQuest(checkIn: Pick<CheckIn, "mood" | "energy" | "progress" | "topics">): {
  quest: Quest;
  primaryTopic: Topic;
} {
  const primaryTopic = checkIn.topics[0] ?? "science";
  const base = FALLBACK_QUESTS[primaryTopic];

  if (checkIn.energy < 33 || checkIn.mood === "tired") {
    return {
      primaryTopic,
      quest: {
        ...base,
        time: "10 min",
        tag: "Gentle quest",
        desc: `${base.desc} Keep it light — a small win counts.`,
      },
    };
  }

  if (checkIn.energy > 75 && checkIn.mood === "restless") {
    return {
      primaryTopic,
      quest: {
        ...base,
        time: "30 min",
        tag: "Ambitious quest",
        desc: `${base.desc} Push a little further than usual.`,
      },
    };
  }

  return { quest: base, primaryTopic };
}
