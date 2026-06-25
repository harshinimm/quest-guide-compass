import type { CheckIn, Feedback, QuestRecommendation, UserProfile } from "@/types/coach";

const MOOD_LABELS: Record<CheckIn["mood"], string> = {
  curious: "curious and open to discovery",
  focused: "focused and ready to go deep",
  playful: "playful and experimental",
  tired: "tired and low on bandwidth",
  inspired: "inspired and energized",
  restless: "restless and craving stimulation",
};

// Maps broad topic IDs to niche sub-domains the AI can draw from
const TOPIC_NICHE_HINTS: Record<string, string> = {
  science:
    "e.g. quantum decoherence, CRISPR base editing, astrobiology, epigenetics, mycorrhizal networks, optogenetics",
  tech:
    "e.g. Transformer attention mechanisms, WebAssembly WASI, homomorphic encryption, causal inference in ML, eBPF, formal verification",
  space:
    "e.g. Lagrange points, magnetars, panspermia hypothesis, orbital mechanics of Starship, dark energy surveys, lunar lava tubes",
  art:
    "e.g. generative adversarial art, the Zhuangzi and aesthetics, brutalist typography, color theory in Bauhaus, calligraphy as meditation",
  nature:
    "e.g. slime mould intelligence, whale song dialects, mycorrhizal wood-wide web, tardigrade cryptobiosis, coral spawning synchrony",
  culture:
    "e.g. cargo cult rituals, linguistic relativity (Sapir–Whorf), the oral tradition of griots, gift economies in Melanesia, tea ceremony philosophy",
  music:
    "e.g. polyrhythm in West African drumming, just intonation vs equal temperament, spectral music composition, the neuroscience of groove",
  history:
    "e.g. the Bronze Age Collapse, Carthaginian child sacrifice debate, Byzantine Greek fire, the Haitian Revolution's impact on Napoleon, Song Dynasty paper money",
  economics:
    "e.g. Goodhart's Law in practice, commons tragedy vs Ostrom's principles, Modern Monetary Theory critiques, price discovery in thin markets, behavioral nudge failures",
  literature:
    "e.g. unreliable narrators in Nabokov, Oulipo constrained writing, Arabic maqama prose, the Rashomon effect in storytelling, autofiction vs memoir",
  philosophy:
    "e.g. externalism about mental content, the hard problem of consciousness (Chalmers), Amartya Sen's capability approach, Wittgenstein's private language argument, moral luck",
  psychology:
    "e.g. predictive processing theory, ego depletion replication crisis, the Solomon Asch conformity variations, attachment theory in adulthood, somatic markers in decision-making",
};

export function buildQuestPrompt(input: {
  checkIn: CheckIn;
  profile: UserProfile;
  recentQuests: QuestRecommendation[];
  recentFeedback: Feedback[];
}): string {
  const { checkIn, profile, recentQuests, recentFeedback } = input;

  const topicHints = checkIn.topics
    .map((t) => `- ${t}: ${TOPIC_NICHE_HINTS[t] ?? "go niche and specific"}`)
    .join("\n");

  const recentQuestLines =
    recentQuests.length > 0
      ? recentQuests.map((q) => `- "${q.title}" (${q.primaryTopic}, ${q.tag})`).join("\n")
      : "- None yet — this is their first quest.";

  const feedbackLines =
    recentFeedback.length > 0
      ? recentFeedback
          .map(
            (f) =>
              `- Rating ${f.rating}/5, completed: ${f.completed}${f.notes ? `, note: "${f.notes}"` : ""}`
          )
          .join("\n")
      : "- No prior feedback.";

  return `You are Curiosity Coach, a weekly learning quest designer for intellectually hungry adults.

Design ONE highly specific, niche micro-quest (15–45 min). Avoid surface-level, Wikipedia-tier topics.
The quest must feel like something a curious expert would assign — surprising, precise, and rabbit-hole-worthy.

## User profile
- Streak: ${profile.streak} days
- Total quests completed: ${profile.totalQuests}
- XP: ${profile.xp}

## This week's check-in
- Mood: ${checkIn.mood} (${MOOD_LABELS[checkIn.mood]})
- Energy level: ${checkIn.energy}/100
- Progress on last quest: ${checkIn.progress}/100
- Topics of interest: ${checkIn.topics.join(", ")}

## Niche sub-domain hints per topic (pick ONE specific angle, don't be generic)
${topicHints}

## Recent quests (DO NOT repeat these or similar titles)
${recentQuestLines}

## Recent feedback
${feedbackLines}

## Rules
1. Match difficulty to energy and mood — low energy = shorter, gentler quest; high energy = ambitious.
2. Be SPECIFIC. Bad: "Explore the psychology of memory." Good: "Investigate the misinformation effect: how post-event suggestion rewrites what witnesses remember."
3. Title: punchy, under 8 words, specific enough to Google directly.
4. desc: 2–3 sentences. Name a concrete phenomenon, experiment, thinker, or debate. End with a reflection question.
5. time: realistic estimate like "20 min" or "35 min".
6. tag: a niche sub-category label like "Cognitive bias" or "Orbital mechanics" — NOT broad like "Psychology" or "Space".
7. articles: exactly 3 items. Each must be a REAL search query the user can run. Use Google Scholar search URLs in this exact format:
   https://scholar.google.com/scholar?q=YOUR+QUERY+HERE
   Make the query specific to the quest topic (e.g. "misinformation+effect+Loftus+eyewitness+memory").
   Give each article a descriptive title (what the search will surface, not a made-up paper title).

Respond with ONLY valid JSON — no markdown, no backticks, no explanation:
{
  "title": "...",
  "desc": "...",
  "time": "...",
  "tag": "...",
  "articles": [
    { "title": "...", "url": "https://scholar.google.com/scholar?q=..." },
    { "title": "...", "url": "https://scholar.google.com/scholar?q=..." },
    { "title": "...", "url": "https://scholar.google.com/scholar?q=..." }
  ]
}`;
}