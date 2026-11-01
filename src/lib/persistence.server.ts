import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type UserDatabase = SupabaseClient<Database>;
export type PersistentTable = Exclude<keyof Database["public"]["Tables"], "profiles" | "user_roles">;
export async function readOwnedTable<T extends PersistentTable>(db: UserDatabase, userId: string, table: T, offset = 0) {
  const query = db.from(table).select("*");
  // Sources are a curated shared catalog; every other read explicitly scopes ownership in addition to RLS.
  const { data, error } = await (table === "job_sources" ? query : query.eq("owner_id", userId)).order("id").range(offset, offset + 99);
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