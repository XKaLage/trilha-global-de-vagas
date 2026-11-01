import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AppShell, meta } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getPersistentAccount } from "@/lib/persistence.functions";

export const Route = createFileRoute("/auth")({ head: () => meta("Acesso privado", "Contas previamente provisionadas da Trilha Global de Vagas. Cadastro público fechado."), component: PrivateAccess });
function PrivateAccess() {
  const check = useServerFn(getPersistentAccount);
  const queryClient = useQueryClient();
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [account, setAccount] = useState<{ candidateId: string; admin: boolean } | null>(null);
  async function verify() {
    setPending(true);
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) { setAccount(null); setFeedback("Sem sessão autenticada. O acesso exige uma conta provisionada; cadastro público permanece fechado."); return; }
      const result = await check(); setAccount(result); setFeedback("Sessão e acesso individual verificados no servidor.");
    } catch { setAccount(null); setFeedback("Conta ou sessão ainda não autorizada para acesso persistente."); }
    finally { setPending(false); }
  }
  async function signOut() { await queryClient.cancelQueries(); queryClient.clear(); await supabase.auth.signOut(); setAccount(null); setFeedback("Sessão encerrada. Dados locais preservados."); }
  return <AppShell title="Acesso privado">
    <section className="space-y-3">
      <p className="text-sm">Cadastro público fechado. Nenhuma conta foi criada nesta etapa.</p>
      <Button disabled={pending} onClick={verify}>{pending ? "Verificando…" : "Verificar sessão existente"}</Button>
      {feedback && <p role="status" className="text-sm">{feedback}</p>}
      {account && <><p className="text-sm">Acesso: {account.admin ? "Administrador verificado" : "Candidato"}</p><Button variant="outline" onClick={signOut}>Sair</Button></>}
    </section>
  </AppShell>;
}