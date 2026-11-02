import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_rule_versions", title: "Consultar versões de regras",
  description: "Consulta até 50 versões persistentes de regras da conta autorizada sem alterar ou ativar regras.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_args, ctx) => {
    const { db, userId } = await supabaseForUser(ctx);
    const { data, error } = await db.from("rule_sets").select("id,version,status").eq("owner_id", userId).order("version", { ascending: false }).limit(50);
    if (error) throw new ToolError("Não foi possível consultar suas versões de regras.");
    return { content: [{ type: "text", text: JSON.stringify({ versions: data ?? [] }) }] };
  },
});