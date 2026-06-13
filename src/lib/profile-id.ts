const PROFILE_ID_KEY = "curiosity-coach-profile-id";

function readLocalProfileId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(PROFILE_ID_KEY);
}

function writeLocalProfileId(id: string): void {
  localStorage.setItem(PROFILE_ID_KEY, id);
}

function readChromeProfileId(): Promise<string | null> {
  return new Promise((resolve) => {
    if (typeof chrome === "undefined" || !chrome.storage?.local) {
      resolve(null);
      return;
    }

    chrome.storage.local.get([PROFILE_ID_KEY], (result) => {
      resolve((result[PROFILE_ID_KEY] as string | undefined) ?? null);
    });
  });
}

function writeChromeProfileId(id: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof chrome === "undefined" || !chrome.storage?.local) {
      resolve();
      return;
    }

    chrome.storage.local.set({ [PROFILE_ID_KEY]: id }, () => resolve());
  });
}

export async function getOrCreateProfileId(): Promise<string> {
  const chromeId = await readChromeProfileId();
  if (chromeId) return chromeId;

  const localId = readLocalProfileId();
  if (localId) {
    await writeChromeProfileId(localId);
    return localId;
  }

  const id = crypto.randomUUID();
  writeLocalProfileId(id);
  await writeChromeProfileId(id);
  return id;
}
