// TinyFish server-side adapter. SERVER ONLY — never import from client code.
// The API key is read from process.env inside each function (never at module
// scope) and is never logged, returned, or included in error messages.
// Only the free Search and Fetch surfaces are used. Agent, Browser, Research
// and Monitor are intentionally NOT implemented here.

const SEARCH_URL = "https://api.search.tinyfish.ai";
const FETCH_URL = "https://api.fetch.tinyfish.ai";
const TIMEOUT_MS = 15_000;
const MAX_FETCH_URLS = 3;
const MAX_TEXT_CHARS = 4_000;

export type TinyfishError =
  | "not_configured" // TINYFISH_API_KEY ausente nos segredos do servidor
  | "unauthorized" // chave rejeitada pelo provedor (401/403)
  | "network" // timeout ou falha de rede
  | `http_${number}`; // outro status HTTP

export type TinyfishSearchResult = {
  title: string;
  url: string;
  snippet: string;
  siteName?: string;
};

export type TinyfishFetchResult = {
  url: string;
  text: string; // markdown truncado
  truncated: boolean;
};

function apiKey(): string | null {
  const k = process.env["TINYFISH_API_KEY"];
  return k && k.trim() ? k : null;
}

function isPublicHttpUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    if (u.protocol !== "http:" && u.protocol !== "https:") return false;
    const h = u.hostname.toLowerCase();
    if (h === "localhost" || h.endsWith(".localhost") || h.endsWith(".internal")) return false;
    // Bloqueia literais de IP privado/loopback (o provedor também rejeita, mas validamos antes)
    if (/^\d+\.\d+\.\d+\.\d+$/.test(h)) {
      const parts = h.split(".").map(Number);
      const a = parts[0] ?? -1;
      const b = parts[1] ?? -1;
      if (a === 10 || a === 127 || a === 0 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 169 && b === 254)) return false;
    }
    if (h === "::1" || h.startsWith("[")) return false;
    return true;
  } catch {
    return false;
  }
}

export async function tinyfishSearch(
  query: string,
  opts: { location?: string; language?: string } = {},
): Promise<{ ok: boolean; error?: TinyfishError; results: TinyfishSearchResult[] }> {
  const key = apiKey();
  if (!key) return { ok: false, error: "not_configured", results: [] };

  const u = new URL(SEARCH_URL);
  u.searchParams.set("query", query);
  if (opts.location) u.searchParams.set("location", opts.location);
  if (opts.language) u.searchParams.set("language", opts.language);

  try {
    const res = await fetch(u, {
      headers: { "X-API-Key": key },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (res.status === 401 || res.status === 403) return { ok: false, error: "unauthorized", results: [] };
    if (!res.ok) return { ok: false, error: `http_${res.status}`, results: [] };
    const data: unknown = await res.json();
    const raw = (data as { results?: unknown })?.results;
    const results: TinyfishSearchResult[] = (Array.isArray(raw) ? raw : [])
      .map((r) => {
        const o = r as Record<string, unknown>;
        const site = o["site_name"];
        const out: TinyfishSearchResult = {
          title: String(o["title"] ?? ""),
          url: String(o["url"] ?? ""),
          snippet: String(o["snippet"] ?? ""),
        };
        if (site) out.siteName = String(site);
        return out;
      })
      .filter((r) => r.title && isPublicHttpUrl(r.url))
      .slice(0, 10);
    return { ok: true, results };
  } catch {
    return { ok: false, error: "network", results: [] };
  }
}

export async function tinyfishFetch(
  urls: string[],
): Promise<{ ok: boolean; error?: TinyfishError; pages: TinyfishFetchResult[] }> {
  const key = apiKey();
  if (!key) return { ok: false, error: "not_configured", pages: [] };

  const clean = urls.filter(isPublicHttpUrl).slice(0, MAX_FETCH_URLS);
  if (clean.length === 0) return { ok: false, error: "http_400", pages: [] };

  try {
    const res = await fetch(FETCH_URL, {
      method: "POST",
      headers: { "X-API-Key": key, "Content-Type": "application/json" },
      body: JSON.stringify({ urls: clean, format: "markdown" }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (res.status === 401 || res.status === 403) return { ok: false, error: "unauthorized", pages: [] };
    if (!res.ok) return { ok: false, error: `http_${res.status}`, pages: [] };
    const data: unknown = await res.json();
    const raw = (data as { results?: unknown })?.results ?? data;
    const list = Array.isArray(raw) ? raw : [];
    const pages: TinyfishFetchResult[] = list.map((p) => {
      const o = p as Record<string, unknown>;
      const full = String(o["text"] ?? o["markdown"] ?? "");
      return {
        url: String(o["url"] ?? ""),
        text: full.slice(0, MAX_TEXT_CHARS),
        truncated: full.length > MAX_TEXT_CHARS,
      };
    });
    return { ok: true, pages };
  } catch {
    return { ok: false, error: "network", pages: [] };
  }
}

// Verificação segura de conexão: faz uma busca mínima e traduz o resultado
// para um status legível. Nunca expõe a chave nem corpos de resposta brutos.
export async function tinyfishStatus(): Promise<{
  configured: boolean;
  verified: boolean;
  detail: string;
}> {
  if (!apiKey()) {
    return {
      configured: false,
      verified: false,
      detail: "Chave TINYFISH_API_KEY ausente. Adicione-a em Configurações do projeto → Segredos e publique novamente.",
    };
  }
  const probe = await tinyfishSearch("tinyfish", { location: "US", language: "en" });
  if (probe.ok) return { configured: true, verified: true, detail: "Chave presente e aceita pelo provedor (busca de teste concluída)." };
  switch (probe.error) {
    case "unauthorized":
      return { configured: true, verified: false, detail: "Chave presente, mas rejeitada pelo provedor. Gere uma nova chave no painel da TinyFish e atualize o segredo." };
    case "network":
      return { configured: true, verified: false, detail: "Não foi possível alcançar a TinyFish (rede/timeout). Tente novamente em instantes." };
    default:
      return { configured: true, verified: false, detail: `O provedor respondeu com erro (${probe.error}). Verifique o status do serviço TinyFish.` };
  }
}
