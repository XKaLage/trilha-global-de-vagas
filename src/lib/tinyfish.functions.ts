import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { tinyfishFetch, tinyfishSearch, tinyfishStatus } from "./tinyfish.server";

// Funções públicas e somente leitura: busca e leitura de páginas via TinyFish.
// Nenhuma ação externa (candidaturas, contas, e-mails) é possível aqui.

export const getTinyfishStatus = createServerFn({ method: "GET" }).handler(async () => {
  return tinyfishStatus();
});

export const searchJobPostings = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        query: z.string().trim().min(3).max(300),
        country: z.enum(["US", "CA"]).default("US"),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const r = await tinyfishSearch(data.query, { location: data.country, language: "en" });
    if (!r.ok) return { ok: false as const, error: r.error, results: [] };
    return { ok: true as const, results: r.results };
  });

export const fetchJobPage = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ urls: z.array(z.string().url()).min(1).max(3) }).parse(input))
  .handler(async ({ data }) => {
    const r = await tinyfishFetch(data.urls);
    if (!r.ok) return { ok: false as const, error: r.error, pages: [] };
    return { ok: true as const, pages: r.pages };
  });
