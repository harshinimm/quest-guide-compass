/// <reference types="chrome" />
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { CheckCircle, KeyRound, AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
// @ts-ignore: Allow CSS side-effect import without type declarations
import "../../src/styles.css";

function Settings() {
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);
  const [testError, setTestError] = useState("");

  useEffect(() => {
    chrome.storage.sync.get("apiKey", (result) => {
      if (typeof result.apiKey === "string") setApiKey(result.apiKey);
    });
  }, []);

  async function handleSave() {
    await new Promise<void>((resolve) =>
      chrome.storage.sync.set({ apiKey: apiKey.trim() }, resolve)
    );
    setSaved(true);
    setTestResult(null);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleTest() {
    setTesting(true);
    setTestResult(null);
    setTestError("");

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey.trim()}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Say hello in one word." }] }],
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err?.error?.message ?? `Error ${response.status}`);
      }

      setTestResult("success");
    } catch (err) {
      setTestResult("error");
      setTestError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setTesting(false);
    }
  }

  async function handleClearData() {
    if (!confirm("This will delete your profile, all check-ins, quests and feedback. Are you sure?")) return;
    await new Promise<void>((resolve) => chrome.storage.sync.clear(resolve));
    setApiKey("");
    alert("All data cleared.");
  }

  return (
    <div className="dark min-h-screen w-full flex items-start justify-center p-6 bg-background text-foreground">
      <div className="w-full max-w-md space-y-6">

        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-accent grid place-items-center">
            <KeyRound className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Settings</h1>
            <p className="text-xs text-muted-foreground">Curiosity Coach</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div>
            <h2 className="text-sm font-semibold">Gemini API Key</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Your key is stored locally and synced across your devices. Never sent anywhere except Google's API.
            </p>
          </div>

          <input
            type="password"
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              setSaved(false);
              setTestResult(null);
            }}
            placeholder="AIza..."
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
          />

          {testResult === "success" && (
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <CheckCircle className="h-3.5 w-3.5" />
              Key is valid and working
            </div>
          )}
          {testResult === "error" && (
            <div className="flex items-start gap-2 text-xs text-destructive">
              <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              {testError}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleTest}
              disabled={!apiKey.trim() || testing}
              variant="secondary"
              className="flex-1 rounded-xl h-10 text-sm"
            >
              {testing ? "Testing…" : "Test key"}
            </Button>
            <Button
              onClick={handleSave}
              disabled={!apiKey.trim()}
              className="flex-1 rounded-xl h-10 text-sm"
            >
              {saved ? "Saved ✓" : "Save key"}
            </Button>
          </div>

          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs text-primary hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            Get a free Gemini API key at Google AI Studio
          </a>
        </div>

        <div className="rounded-2xl border border-destructive/30 bg-card p-5 space-y-3">
          <h2 className="text-sm font-semibold text-destructive">Danger Zone</h2>
          <p className="text-xs text-muted-foreground">
            Permanently delete your profile, streaks, quests and all feedback from storage.
          </p>
          <Button
            onClick={handleClearData}
            variant="destructive"
            className="rounded-xl h-10 text-sm w-full"
          >
            Clear all data
          </Button>
        </div>

      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<Settings />);