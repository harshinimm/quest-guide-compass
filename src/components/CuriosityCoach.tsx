import { useEffect, useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

type Step = "welcome" | "checkin" | "sliders" | "topics" | "generating" | "quest";

const TOPICS = [
  { id: "science", label: "Science", icon: Brain, hue: "from-cyan-400/30 to-blue-500/30" },
  { id: "tech", label: "Technology", icon: Code2, hue: "from-violet-400/30 to-fuchsia-500/30" },
  { id: "space", label: "Space", icon: Rocket, hue: "from-indigo-400/30 to-purple-500/30" },
  { id: "art", label: "Art & Design", icon: Palette, hue: "from-pink-400/30 to-rose-500/30" },
  { id: "nature", label: "Nature", icon: Leaf, hue: "from-emerald-400/30 to-teal-500/30" },
  { id: "culture", label: "Culture", icon: Globe2, hue: "from-amber-400/30 to-orange-500/30" },
  { id: "music", label: "Music", icon: Music, hue: "from-fuchsia-400/30 to-pink-500/30" },
  { id: "history", label: "History", icon: BookOpen, hue: "from-yellow-400/30 to-amber-500/30" },
];

const MOODS = [
  { id: "curious", label: "Curious", emoji: "🤔" },
  { id: "focused", label: "Focused", emoji: "🎯" },
  { id: "playful", label: "Playful", emoji: "🎨" },
  { id: "tired", label: "Tired", emoji: "😴" },
  { id: "inspired", label: "Inspired", emoji: "✨" },
  { id: "restless", label: "Restless", emoji: "⚡" },
];

const QUESTS: Record<string, { title: string; desc: string; time: string; tag: string }> = {
  science: { title: "Decode a single cell", desc: "Spend 15 minutes mapping how a mitochondrion turns food into the energy reading these words.", time: "15 min", tag: "Micro deep-dive" },
  tech: { title: "Reverse-engineer a daily app", desc: "Pick one app you opened today and sketch the 3 systems that make it feel instant.", time: "20 min", tag: "Builder's eye" },
  space: { title: "Find your cosmic address", desc: "Trace your location from your chair → Earth → solar system → local arm of the galaxy.", time: "10 min", tag: "Perspective shift" },
  art: { title: "Steal like a curator", desc: "Collect 5 images that share one invisible quality. Name the quality in a single word.", time: "25 min", tag: "Pattern hunt" },
  nature: { title: "Notice one tree", desc: "Find a tree near you. Learn its name, its age range, and what visits it this season.", time: "15 min", tag: "Field study" },
  culture: { title: "Borrow a worldview", desc: "Read one short essay from a culture you know little about. Note one belief that surprised you.", time: "20 min", tag: "Empathy rep" },
  music: { title: "Hear a song's skeleton", desc: "Pick a favorite track. Listen 3 times, each focused on bass, rhythm, or melody only.", time: "12 min", tag: "Active listening" },
  history: { title: "Time-travel to a Tuesday", desc: "Pick a year. Discover what an ordinary Tuesday looked like for a regular person living then.", time: "20 min", tag: "Story dive" },
};

export function CuriosityCoach() {
  const [step, setStep] = useState<Step>("welcome");
  const [mood, setMood] = useState<string | null>(null);
  const [energy, setEnergy] = useState([60]);
  const [progress, setProgress] = useState([40]);
  const [topics, setTopics] = useState<string[]>([]);

  useEffect(() => {
    if (step === "generating") {
      const t = setTimeout(() => setStep("quest"), 2400);
      return () => clearTimeout(t);
    }
  }, [step]);

  const stepIndex = ["welcome", "checkin", "sliders", "topics", "generating", "quest"].indexOf(step);
  const progressPct = (stepIndex / 5) * 100;

  const toggleTopic = (id: string) => {
    setTopics((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : prev.length >= 3 ? prev : [...prev, id]
    );
  };

  const primaryTopic = topics[0] ?? "science";
  const quest = QUESTS[primaryTopic];

  return (
    <div className="dark min-h-screen w-full flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-[420px] animate-scale-in relative">
        {/* Ambient glow halo around card */}
        <div aria-hidden className="pointer-events-none absolute -inset-10 -z-10 rounded-[3rem] bg-gradient-to-br from-primary/25 via-accent/20 to-transparent blur-3xl opacity-80" />
        {/* Browser-extension chrome */}
        <div className="rounded-3xl border border-white/10 bg-card/60 backdrop-blur-2xl glow-soft overflow-hidden">

          {/* Top bar */}
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
            <div className="flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5 text-warning" />
              <span className="text-xs font-medium">7 day streak</span>
            </div>
          </div>

          {/* Progress */}
          <div className="h-1 bg-secondary/60">
            <div
              className="h-full bg-gradient-primary transition-all duration-500"
              style={{ width: `${Math.max(progressPct, 4)}%` }}
            />
          </div>

          {/* Body */}
          <div key={step} className="p-6 min-h-[460px] flex flex-col animate-fade-in">
            {step === "welcome" && (
              <Welcome onNext={() => setStep("checkin")} />
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

            {step === "generating" && <Generating />}

            {step === "quest" && (
              <Quest
                quest={quest}
                onRestart={() => {
                  setStep("welcome");
                  setMood(null);
                  setTopics([]);
                }}
                onRegenerate={() => setStep("generating")}
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

/* ---------- Sub-screens ---------- */

function Welcome({ onNext }: { onNext: () => void }) {
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
          { k: "Quests", v: "12" },
          { k: "Streak", v: "7d" },
          { k: "XP", v: "1,240" },
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
}: { mood: string | null; setMood: (m: string) => void; onBack: () => void; onNext: () => void }) {
  return (
    <div className="flex flex-col flex-1">
      <StepHeader index={1} title="How are you arriving?" subtitle="Pick the mood closest to right now." />
      <div className="grid grid-cols-3 gap-2 mt-5">
        {MOODS.map((m) => {
          const active = mood === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setMood(m.id)}
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

      <div className="mt-5 grid grid-cols-2 gap-2.5">
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

function Generating() {
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
        Mixing your mood, energy, and topics into something just unfamiliar enough.
      </p>

      <div className="mt-6 w-full space-y-2">
        {["Reading your check-in", "Scanning curious threads", "Tuning difficulty"].map((s, i) => (
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
  quest, onRestart, onRegenerate,
}: { quest: { title: string; desc: string; time: string; tag: string }; onRestart: () => void; onRegenerate: () => void }) {
  return (
    <div className="flex flex-col flex-1">
      <div className="text-[11px] uppercase tracking-[0.18em] text-primary font-semibold">Your quest this week</div>

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

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        {[
          { k: "Reward", v: "+120 XP" },
          { k: "Effort", v: "Low" },
          { k: "Streak", v: "+1" },
        ].map((m) => (
          <div key={m.k} className="rounded-xl bg-secondary/50 border border-border py-2">
            <div className="text-sm font-semibold">{m.v}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{m.k}</div>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-6 flex flex-col gap-2">
        <Button className="h-11 rounded-xl font-semibold gap-2">
          Accept quest <ArrowRight className="h-4 w-4" />
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

/* ---------- Bits ---------- */

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
