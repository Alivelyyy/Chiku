const API_URL = process.env.BOT_API_URL;
const API_KEY = process.env.BOT_API_KEY;

async function botFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!API_URL || !API_KEY) {
    throw new Error("Bot API not configured. Make sure BOT_API_URL and BOT_API_KEY are set.");
  }

  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
      },
      cache: "no-store",
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error((err as any).error || `HTTP ${res.status}`);
    }
    return res.json() as Promise<T>;
  } catch (err: any) {
    if (err.name === "AbortError") {
      throw new Error("Bot API timeout - bot may be offline");
    }
    throw err;
  }
}

export const botApi = {
  stats:    () => botFetch("/api/stats"),
  guilds:   () => botFetch("/api/guilds"),
  guild:    (id: string) => botFetch(`/api/guilds/${id}`),
  player:   (id: string) => botFetch(`/api/guilds/${id}/player`),
  queue:    (id: string) => botFetch(`/api/guilds/${id}/queue`),
  settings: (id: string) => botFetch(`/api/guilds/${id}/settings`),

  playerAction: (id: string, action: string, body?: object) =>
    botFetch(`/api/guilds/${id}/player/${action}`, {
      method: "POST",
      body:   body ? JSON.stringify(body) : undefined,
    }),

  removeTrack: (id: string, index: number) =>
    botFetch(`/api/guilds/${id}/queue/${index}`, { method: "DELETE" }),

  clearQueue: (id: string) =>
    botFetch(`/api/guilds/${id}/queue`, { method: "DELETE" }),

  queueAction: (id: string, action: string) =>
    botFetch(`/api/guilds/${id}/queue/${action}`, { method: "POST" }),

  updateSettings: (id: string, data: object) =>
    botFetch(`/api/guilds/${id}/settings`, {
      method: "PATCH",
      body:   JSON.stringify(data),
    }),
};
