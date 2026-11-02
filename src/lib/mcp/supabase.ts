import { createClient } from "@supabase/supabase-js";
import { ToolError, type ToolContext } from "@lovable.dev/mcp-js";
import type { Database } from "@/integrations/supabase/types";

export async function supabaseForUser(ctx: ToolContext) {
  const token = ctx.getToken();
  const userId = ctx.getUserId();
  if (!ctx.isAuthenticated() || !token || !userId) throw new ToolError("Acesso autenticado necessário.");
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new ToolError("Acesso persistente indisponível.");
  const db = createClient<Database>(url, key, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await db.from("candidate_profiles").select("id").eq("owner_id", userId).maybeSingle();
  if (error || !data) throw new ToolError("Conta não provisionada para acesso individual.");
  return { db, userId };
}