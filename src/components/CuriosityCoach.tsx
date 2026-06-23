import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Zap,
  TrendingUp,
  Brain,
  Rocket,
  Palette,
  Code2,
  Leaf,
  Globe2,
  Music,
  BookOpen,
  Check,
  RefreshCw,
  Flame,
  Star,
  AlertCircle,
  Settings,
  ExternalLink,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { CoachApi } from "@/lib/api/coach-api";
import { getOrCreateProfileId } from "@/lib/profile-id";
import { getActiveQuest, clearActiveQuest } from "@/lib/api/coach-api.extension";
import type { Mood, QuestRecommendation, UserProfile } from "@/types/coach";

type Step =
  | "loading"
  | "welcome"
  | "checkin"
  | "sliders"
  | "topics"
  | "generating"
  | "quest"
  | "feedback";

const TOPICS = [
  { id: "science", label: "Science", icon: Brain, hue: "from-cyan-400/30 to-blue-500/30" },
  { id: "tech", label: "Technology", icon: Code2, hue: "from-violet-400/30 to-fuchsia-500/30" },
  { id: "space", label: "Space", icon: Rocket, hue: "from-indigo-400/30 to-purple-500/30" },
  { id: "art", label: "Art & Design", icon: Palette, hue: "from-pink-400/30 to-rose-500/30" },
  { id: "nature", label: "Nature", icon: Leaf, hue: "from-emerald-400/30 to-teal-500/30" },
  { id: "culture", label: "Culture", icon: Globe2, hue: "from-amber-400/30 to-orange-500/30" },
  { id: "music", label: "Music", icon: Music, hue: "from-fuchsia-400/30 to-pink-500/30" },
  { id: "history", label: "History", icon: BookOpen, hue: "from-yellow-400/30 to-amber-500/30" },
  { id: "economics", label: "Economics", icon: TrendingUp, hue: "from-green-400/30 to-emerald-500/30" },
  { id: "literature", label: "Literature", icon: BookOpen, hue: "from-orange-400/30 to-red-500/30" },
  { id: "philosophy", label: "Philosophy", icon: Brain, hue: "from-slate-400/30 to-gray-500/30" },
  { id: "psychology", label: "Psychology", icon: Sparkles, hue: "from-purple-400/30 to-violet-500/30" },
];

const MOODS = [
  { id: "curious", label: "Curious", emoji: "🤔" },
  { id: "focused", label: "Focused", emoji: "🎯" },
  { id: "playful", label: "Playful", emoji: "🎨" },
  { id: "tired", label: "Tired", emoji: "😴" },
  { id: "inspired", label: "Inspired", emoji: "✨" },
  { id: "restless", label: "Restless", emoji: "⚡" },
];

const STEPS: Step[] = [
  "loading",
  "welcome",
  "checkin",
  "sliders",
  "topics",
  "generating",
  "quest",
  "feedback",
];

export function CuriosityCoach({ api }: { api: CoachApi }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>("loading");
  const [mood, setMood] = useState<Mood | null>(null);
  const [energy, setEnergy] = useState([60]);
  const [progress, setProgress] = useState([40]);
  const [topics, setTopics] = useState<string[]>([]);
  const [quest, setQuest] = useState<QuestRecommendation | null>(null);
  const [activeQuestAssignedAt, setActiveQuestAssignedAt] = useState<string | null>(null);
  const [rating, setRating] = useState(4);
  const [completed, setCompleted] = useState(true);
  const [notes, setNotes] = useState("");

  // ── Check for active quest on mount ──
  useEffect(() => {
    getActiveQuest().then((active) => {
      if (active) {
        setQuest(active.quest);
        setActiveQuestAssignedAt(active.assignedAt);
        setStep("quest");
      } else {
        setStep("welcome");
      }
    }).catch(() => setStep("welcome"));
  }, []);

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const profileId = await getOrCreateProfileId();
      return api.createOrGetProfile(profileId);
    },
  });

  const questMutation = useMutation({
    mutationFn: async () => {
      const profileId = await getOrCreateProfileId();
      const checkIn = await api.submitCheckIn({
        profileId,
        mood: mood!,
        energy: energy[0],
        progress: progress[0],
        topics: topics as QuestRecommendation["primaryTopic"][],
      });
      return api.generateQuest({ profileId, checkInId: checkIn.id });
    },
    onSuccess: (result) => {
      setQuest(result);
      setActiveQuestAssignedAt(new Date().toISOString());
      setStep("quest");
    },
  });

  const feedbackMutation = useMutation({
    mutationFn: async () => {
      if (!quest) throw new Error("No quest to rate");
      const profileId = await getOrCreateProfileId();
      return api.storeFeedback({
        profileId,
        questId: quest.id,
        rating,
        completed,
        notes: notes.trim() || undefined,
      });
    },
    onSuccess: ({ profile }) => {
      queryClient.setQueryData<UserProfile>(["profile"], profile);
      resetFlow();
      setStep("welcome");
    },
  });

  useEffect(() => {
    if (step !== "generating") return;
    if (questMutation.isPending || questMutation.isSuccess || questMutation.isError) return;
    questMutation.mutate();
  }, [step, questMutation.isPending, questMutation.isSuccess, questMutation.isError, questMutation.mutate]);

  const profile = profileQuery.data;
  const stepIndex = STEPS.indexOf(step);
  const progressPct = (stepIndex / (STEPS.length - 1)) * 100;

  const toggleTopic = (id: string) => {
    setTopics((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : prev.length >= 3 ? prev : [...prev, id]
    );
  };

  function resetFlow() {
    setMood(null);
    setTopics([]);
    setQuest(null);
    setActiveQuestAssignedAt(null);
    setRating(4);
    setCompleted(true);
    setNotes("");
    questMutation.reset();
    feedbackMutation.reset();
  }

  async function handleRegenerate() {
    setQuest(null);
    setActiveQuestAssignedAt(null);
    questMutation.reset();
    setStep("generating");
  }

  async function handleStartOver() {
    await clearActiveQuest();
    resetFlow();
    setStep("welcome");
  }

  // ── Days remaining for active quest ──
  const daysRemaining = activeQuestAssignedAt
    ? Math.max(0, 7 - Math.floor((Date.now() - new Date(activeQuestAssignedAt).getTime()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="dark min-h-[600px] w-[420px] max-w-full flex items-stretch justify-center p-0 sm:p-0">
      <div className="w-full animate-scale-in relative flex-1">
        <div aria-hidden className="pointer-events-none absolute -inset-10 -z-10 rounded-[3rem] bg-gradient-to-br from-primary/25 via-accent/20 to-transparent blur-3xl opacity-80" />
        <div className="rounded-3xl border border-white/10 bg-card/60 backdrop-blur-2xl glow-soft overflow-hidden">

          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/40">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-gradient-primary grid place-items-center shadow-glow">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="leading-tight">
                <div className="text-[13px] font-semibold tracking-tight">Curiosity Coach</div>
                <div className="text-[10px] text-muted-foreground">Daily quest, smarter you</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Flame className="h-3.5 w-3.5 text-warning" />
              <span className="text-xs font-medium">
                {profile ? `${profile.streak} day streak` : "…"}
              </span>
              <button
                onClick={() => chrome.runtime.openOptionsPage()}
                className="h-7 w-7 rounded-lg bg-secondary grid place-items-center hover:bg-secondary/80 transition-colors"
                title="Settings"
              >
                <Settings className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
          </div>

          <div className="h-1 bg-secondary/60">
            <div
              className="h-full bg-gradient-primary transition-all duration-500"
              style={{ width: `${Math.max(progressPct, 4)}%` }}
            />
          </div>

          <div key={step} className="p-6 min-h-[460px] flex flex-col animate-fade-in">
            {step === "loading" && (
              <div className="flex-1 flex items-center justify-center">
                <div className="h-8 w-8 rounded-full border-2 border-transparent border-t-primary border-r-accent animate-spin" />
              </div>
            )}
            {step === "welcome" && (
              <Welcome profile={profile} onNext={() => setStep("checkin")} />
            )}
            {step === "checkin" && (
              <CheckIn
                mood={mood}
                setMood={setMood}
                onBack={() => setStep("welcome")}
                onNext={() => setStep("sliders")}
              />
            )}
            {step === "sliders" && (
              <Sliders
                energy={energy[0]}
                progress={progress[0]}
                setEnergy={(v) => setEnergy([v])}
                setProgress={(v) => setProgress([v])}
                onBack={() => setStep("checkin")}
                onNext={() => setStep("topics")}
              />
            )}
            {step === "topics" && (
              <Topics
                selected={topics}
                toggle={toggleTopic}
                onBack={() => setStep("sliders")}
                onNext={() => setStep("generating")}
              />
            )}
            {step === "generating" && (
              <Generating
                error={questMutation.error}
                onRetry={handleRegenerate}
              />
            )}
            {step === "quest" && quest && (
              <Quest
                quest={quest}
                daysRemaining={daysRemaining}
                onAccept={() => setStep("feedback")}
                onRegenerate={handleRegenerate}
                onRestart={handleStartOver}
              />
            )}
            {step === "feedback" && quest && (
              <Feedback
                questTitle={quest.title}
                rating={rating}
                setRating={setRating}
                completed={completed}
                setCompleted={setCompleted}
                notes={notes}
                setNotes={setNotes}
                isSubmitting={feedbackMutation.isPending}
                onBack={() => setStep("quest")}
                onSubmit={() => feedbackMutation.mutate()}
              />
            )}
          </div>
        </div>

        <p className="mt-3 text-center text-[11px] text-muted-foreground">
          Tip: pin this extension for your daily 2-minute check-in.
        </p>
      </div>
    </div>
  );
}

function Welcome({
  profile,
  onNext,
}: {
  profile: UserProfile | undefined;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col items-center text-center flex-1 justify-center">
      <div className="relative mb-6 animate-float">
        <div className="absolute inset-0 bg-gradient-primary blur-2xl opacity-50 rounded-full" />
        <div className="relative h-20 w-20 rounded-3xl bg-gradient-primary grid place-items-center shadow-glow animate-pulse-glow">
          <Sparkles className="h-9 w-9 text-primary-foreground" />
        </div>
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">Hey, curious mind.</h1>
      <p className="mt-2 text-sm text-muted-foreground max-w-[280px]">
        Let's design this week's quest. Two minutes, three questions, one spark.
      </p>

      <div className="mt-8 grid grid-cols-3 gap-2 w-full">
        {[
          { k: "Quests", v: profile ? String(profile.totalQuests) : "—" },
          { k: "Streak", v: profile ? `${profile.streak}d` : "—" },
          { k: "XP", v: profile ? profile.xp.toLocaleString() : "—" },
        ].map((s) => (
          <div key={s.k} className="rounded-xl bg-secondary/60 border border-border p-3">
            <div className="text-base font-semibold">{s.v}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.k}</div>
          </div>
        ))}
      </div>

      <Button onClick={onNext} className="mt-8 w-full h-11 rounded-xl gap-2 font-semibold">
        Start weekly check-in <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

function CheckIn({
  mood, setMood, onBack, onNext,
}: { mood: Mood | null; setMood: (m: Mood) => void; onBack: () => void; onNext: () => void }) {
  return (
    <div className="flex flex-col flex-1">
      <StepHeader index={1} title="How are you arriving?" subtitle="Pick the mood closest to right now." />
      <div className="grid grid-cols-3 gap-2 mt-5">
        {MOODS.map((m) => {
          const active = mood === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setMood(m.id as Mood)}
              className={cn(
                "group rounded-2xl border p-3 flex flex-col items-center gap-1 transition-all duration-200",
                "hover:-translate-y-0.5 hover:border-primary/60",
                active
                  ? "bg-primary/15 border-primary shadow-glow"
                  : "bg-secondary/40 border-border"
              )}
            >
              <span className="text-2xl">{m.emoji}</span>
              <span className="text-xs font-medium">{m.label}</span>
            </button>
          );
        })}
      </div>
      <NavRow onBack={onBack} onNext={onNext} disabled={!mood} />
    </div>
  );
}

function Sliders({
  energy, progress, setEnergy, setProgress, onBack, onNext,
}: {
  energy: number; progress: number;
  setEnergy: (v: number) => void; setProgress: (v: number) => void;
  onBack: () => void; onNext: () => void;
}) {
  return (
    <div className="flex flex-col flex-1">
      <StepHeader index={2} title="Calibrate the week" subtitle="Be honest — quests adapt to where you are." />
      <div className="mt-6 space-y-6">
        <SliderBlock
          icon={<Zap className="h-4 w-4" />}
          label="Energy"
          value={energy}
          onChange={setEnergy}
          hint={energy < 33 ? "Low — gentle quest" : energy < 67 ? "Steady — focused quest" : "High — ambitious quest"}
        />
        <SliderBlock
          icon={<TrendingUp className="h-4 w-4" />}
          label="Progress on last quest"
          value={progress}
          onChange={setProgress}
          hint={progress < 33 ? "Just started" : progress < 67 ? "Halfway there" : "Nearly complete"}
        />
      </div>
      <NavRow onBack={onBack} onNext={onNext} />
    </div>
  );
}

function SliderBlock({
  icon, label, value, onChange, hint,
}: { icon: React.ReactNode; label: string; value: number; onChange: (v: number) => void; hint: string }) {
  return (
    <div className="rounded-2xl border border-border bg-secondary/40 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="h-7 w-7 rounded-lg bg-primary/15 text-primary grid place-items-center">{icon}</span>
          {label}
        </div>
        <span className="text-sm font-semibold tabular-nums">{value}%</span>
      </div>
      <Slider value={[value]} onValueChange={(v) => onChange(v[0])} max={100} step={1} />
      <div className="mt-2 text-[11px] text-muted-foreground">{hint}</div>
    </div>
  );
}

function Topics({
  selected, toggle, onBack, onNext,
}: { selected: string[]; toggle: (id: string) => void; onBack: () => void; onNext: () => void }) {
  return (
    <div className="flex flex-col flex-1">
      <StepHeader
        index={3}
        title="What's pulling you in?"
        subtitle={`Pick up to 3 (${selected.length}/3 selected).`}
      />
      <div className="mt-5 grid grid-cols-2 gap-2.5 overflow-y-auto max-h-[320px] pr-1">
        {TOPICS.map((t) => {
          const Icon = t.icon;
          const active = selected.includes(t.id);
          return (
            <button
              key={t.id}
              onClick={() => toggle(t.id)}
              className={cn(
                "relative rounded-2xl border p-3 text-left transition-all duration-200 overflow-hidden",
                "hover:-translate-y-0.5",
                active
                  ? "border-primary bg-primary/10 shadow-glow"
                  : "border-border bg-secondary/40 hover:border-primary/40"
              )}
            >
              <div className={cn("absolute inset-0 bg-gradient-to-br opacity-40", t.hue)} />
              <div className="relative flex items-center justify-between">
                <Icon className="h-5 w-5" />
                {active && (
                  <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground grid place-items-center animate-scale-in">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                )}
              </div>
              <div className="relative mt-3 text-sm font-semibold">{t.label}</div>
            </button>
          );
        })}
      </div>
      <NavRow onBack={onBack} onNext={onNext} disabled={selected.length === 0} nextLabel="Generate quest" />
    </div>
  );
}

function Generating({
  error,
  onRetry,
}: {
  error: Error | null;
  onRetry: () => void;
}) {
  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <h2 className="mt-4 text-lg font-semibold">Couldn't generate your quest</h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-[280px]">
          {error.message || "Something went wrong. Try again."}
        </p>
        <Button onClick={onRetry} className="mt-6 rounded-xl">
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-gradient-primary blur-3xl opacity-50 animate-pulse-glow" />
        <div className="relative h-24 w-24 rounded-full border-2 border-primary/40 grid place-items-center">
          <div className="absolute inset-1 rounded-full border-2 border-transparent border-t-primary border-r-accent animate-spin" />
          <Sparkles className="h-8 w-8 text-primary animate-float" />
        </div>
      </div>
      <h2 className="mt-8 text-xl font-semibold tracking-tight">Generating your quest…</h2>
      <p className="mt-2 text-sm text-muted-foreground max-w-[280px]">
        Saving your check-in, building your profile context, and crafting a recommendation.
      </p>
      <div className="mt-6 w-full space-y-2">
        {["Saving check-in", "Building LLM prompt", "Personalizing quest"].map((s, i) => (
          <div
            key={s}
            className="flex items-center gap-3 rounded-xl bg-secondary/40 border border-border px-3 py-2 text-xs"
            style={{ animation: `slide-up 0.5s ${i * 0.25}s both` }}
          >
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-muted-foreground">{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Quest({
  quest, daysRemaining, onAccept, onRegenerate, onRestart,
}: {
  quest: QuestRecommendation;
  daysRemaining: number | null;
  onAccept: () => void;
  onRegenerate: () => void;
  onRestart: () => void;
}) {
  return (
    <div className="flex flex-col flex-1">
      <div className="flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-[0.18em] text-primary font-semibold">
          Your quest this week
        </div>
        <div className="flex items-center gap-1.5">
          {daysRemaining !== null && (
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {daysRemaining}d left
            </span>
          )}
          <span className="text-[10px] text-muted-foreground">
            {quest.source === "llm" ? "AI-crafted" : "Curated"}
          </span>
        </div>
      </div>

      <div className="mt-3 relative rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-accent/10 p-5 overflow-hidden">
        <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-primary/20 blur-2xl" />
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-accent/20 blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-2 text-[10px]">
            <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary font-semibold">{quest.tag}</span>
            <span className="px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{quest.time}</span>
          </div>
          <h2 className="mt-3 text-xl font-semibold tracking-tight leading-snug">{quest.title}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{quest.desc}</p>
        </div>
      </div>

      {/* ── Article links ── */}
      {quest.articles && quest.articles.length > 0 && (
        <div className="mt-4 rounded-2xl border border-border bg-secondary/40 p-4 space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Recommended reads
          </div>
          {quest.articles.map((article, i) => (
            
              key={i}
              href={article.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-start gap-2 text-xs text-primary hover:underline group"
            >
              <ExternalLink className="h-3 w-3 mt-0.5 shrink-0 group-hover:translate-x-0.5 transition-transform" />
              <span className="line-clamp-2">{article.title}</span>
            </a>
          ))}
        </div>
      )}

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        {[
          { k: "Reward", v: "+120 XP" },
          { k: "Topic", v: quest.primaryTopic },
          { k: "Streak", v: "+1 on journal" },
        ].map((m) => (
          <div key={m.k} className="rounded-xl bg-secondary/50 border border-border py-2">
            <div className="text-sm font-semibold capitalize">{m.v}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{m.k}</div>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-6 flex flex-col gap-2">
        <Button onClick={onAccept} className="h-11 rounded-xl font-semibold gap-2">
          Submit journal & complete <ArrowRight className="h-4 w-4" />
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" className="h-10 rounded-xl gap-2" onClick={onRegenerate}>
            <RefreshCw className="h-3.5 w-3.5" /> Regenerate
          </Button>
          <Button variant="ghost" className="h-10 rounded-xl" onClick={onRestart}>
            Start over
          </Button>
        </div>
      </div>
    </div>
  );
}

function Feedback({
  questTitle,
  rating,
  setRating,
  completed,
  setCompleted,
  notes,
  setNotes,
  isSubmitting,
  onBack,
  onSubmit,
}: {
  questTitle: string;
  rating: number;
  setRating: (v: number) => void;
  completed: boolean;
  setCompleted: (v: boolean) => void;
  notes: string;
  setNotes: (v: string) => void;
  isSubmitting: boolean;
  onBack: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="flex flex-col flex-1">
      <StepHeader
        index={4}
        title="How was the quest?"
        subtitle={`Quick feedback on "${questTitle}".`}
      />

      <div className="mt-6 space-y-5">
        <div className="rounded-2xl border border-border bg-secondary/40 p-4">
          <div className="text-sm font-medium mb-3">Rating</div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setRating(n)}
                className={cn(
                  "h-10 w-10 rounded-xl border flex items-center justify-center transition-all",
                  rating >= n
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-background text-muted-foreground"
                )}
              >
                <Star className={cn("h-4 w-4", rating >= n && "fill-current")} />
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-secondary/40 p-4">
          <div className="text-sm font-medium mb-3">Did you complete it?</div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Yes", value: true },
              { label: "Not yet", value: false },
            ].map((opt) => (
              <button
                key={opt.label}
                onClick={() => setCompleted(opt.value)}
                className={cn(
                  "rounded-xl border py-2.5 text-sm font-medium transition-all",
                  completed === opt.value
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-background text-muted-foreground"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
          <div className="flex items-center justify-between mb-1">
            <div className="text-sm font-semibold">Journal entry</div>
            <span className="text-[10px] text-primary font-medium uppercase tracking-wider">+1 streak if filled</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            What did you learn? What surprised you? How does it connect to your life?
          </p>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Write your reflection here — this is what your agent learns from next time…"
            className="min-h-[100px] resize-none rounded-xl bg-background"
            maxLength={500}
          />
          <div className="mt-1.5 text-right text-[10px] text-muted-foreground">{notes.length}/500</div>
        </div>
      </div>

      <div className="mt-auto pt-6 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-11 w-11 rounded-xl shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex-1 h-11 rounded-xl gap-2 font-semibold"
        >
          {isSubmitting ? "Saving…" : "Save & complete"} <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function StepHeader({ index, title, subtitle }: { index: number; title: string; subtitle: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.18em] text-primary font-semibold">Step {index} of 3</div>
      <h2 className="mt-1 text-xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function NavRow({
  onBack, onNext, disabled, nextLabel = "Continue",
}: { onBack: () => void; onNext: () => void; disabled?: boolean; nextLabel?: string }) {
  return (
    <div className="mt-auto pt-6 flex items-center gap-2">
      <Button variant="ghost" size="icon" onClick={onBack} className="h-11 w-11 rounded-xl shrink-0">
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <Button onClick={onNext} disabled={disabled} className="flex-1 h-11 rounded-xl gap-2 font-semibold">
        {nextLabel} <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}