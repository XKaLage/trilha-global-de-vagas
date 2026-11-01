import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type UserDatabase = SupabaseClient<Database>;
export type PersistentTable = Exclude<keyof Database["public"]["Tables"], "profiles" | "user_roles">;
export async function readOwnedTable(db: UserDatabase, userId: string, table: PersistentTable, offset = 0) {
  // Narrow the shared catalog separately so owner_id is guaranteed on the remaining union.
  if (table === "job_sources") {
    const { data, error } = await db.from("job_sources").select("*").order("id").range(offset, offset + 99);
    if (error) throw new Error("Não foi possível consultar as fontes permitidas.");
    return data;
  }
  const { data, error } = await db.from(table).select("*").eq("owner_id", userId).order("id").range(offset, offset + 99);
  if (error) throw new Error("Não foi possível consultar seus registros persistentes.");
  return data;
}
export async function ownedCandidate(db: UserDatabase, userId: string) {
  const { data, error } = await db.from("candidate_profiles").select("*").eq("owner_id", userId).maybeSingle();
  if (error || !data) throw new Error("Conta ainda não provisionada para acesso persistente.");
  return data;
}
export function databaseError(error: { code?: string } | null) {
  if (error) throw new Error(error.code === "23505" ? "Vaga ou registro duplicado; nenhum dado foi sobrescrito." : "Operação persistente bloqueada ou indisponível.");
}