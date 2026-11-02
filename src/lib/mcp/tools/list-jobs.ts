import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_jobs", title: "Consultar minhas vagas",
  description: "Consulta até 50 vagas persistentes da conta autorizada; não lê dados locais nem executa candidaturas.",
  inputSchema: { offset: z.number().int().min(0).max(10000).default(0).describe("Posição inicial da página de até 50 vagas.") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ offset }, ctx) => {
    const { db, userId } = await supabaseForUser(ctx);
    const { data, error } = await db.from("jobs").select("id,title,employer,country,location,canonical_url").eq("owner_id", userId).order("id").range(offset, offset + 49);
    if (error) throw new ToolError("Não foi possível consultar suas vagas.");
    return { content: [{ type: "text", text: JSON.stringify({ jobs: data ?? [], localDataIncluded: false }) }] };
  },
});