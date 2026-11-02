import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, meta } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  head: () => meta("Autorizar agente", "Autorização individual para consultas somente leitura na Trilha Global de Vagas."),
  validateSearch: (s: Record<string, unknown>) => ({ authorization_id: typeof s["authorization_id"] === "string" ? s["authorization_id"] : "" }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Solicitação ausente.");
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth", search: { next: location.pathname + location.searchStr + location.hash } });
  },
  loader: async ({ location }) => {
    const id = new URLSearchParams(location.searchStr).get("authorization_id");
    if (!id) throw new Error("Solicitação ausente.");
    const { data, error } = await supabase.auth.oauth.getAuthorizationDetails(id);
    if (error || !data) throw new Error("Solicitação inválida ou expirada.");
    if ("redirect_url" in data && data.redirect_url) throw redirect({ href: data.redirect_url });
    return data;
  },
  errorComponent: () => <AppShell title="Conexão não autorizada"><p role="alert">A solicitação está ausente, expirou ou não pôde ser verificada. Inicie novamente pelo agente.</p></AppShell>,
  component: Consent,
});
function Consent() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function decide(approve: boolean) {
    setBusy(true); setError("");
    try {
      const result = approve ? await supabase.auth.oauth.approveAuthorization(authorization_id) : await supabase.auth.oauth.denyAuthorization(authorization_id);
      if (result.error || !result.data?.redirect_url) throw new Error("Não confirmado.");
      window.location.assign(result.data.redirect_url);
    } catch { setError("Não foi possível confirmar sua decisão. Tente novamente."); setBusy(false); }
  }
  if (!("client" in details)) return <AppShell title="Autorização indisponível"><p>Reinicie a conexão pelo agente.</p></AppShell>;
  return <AppShell title={`Conectar ${details.client.name} à Trilha Global de Vagas`}>
    <p>Permitir consultas das suas vagas persistentes e versões de regras, respeitando suas permissões.</p>
    <p className="text-sm break-all">Destino do agente: {details.redirect_uri}</p>
    <p className="text-sm">Identidade solicitada: {details.scope || "Não informada"}</p>
    <p className="text-sm">Sem acesso ao Gmail, documentos, dados locais ou envio de candidaturas.</p>
    {error && <p role="alert">{error}</p>}
    <div className="flex flex-wrap gap-3"><Button disabled={busy} onClick={() => decide(true)}>Permitir consultas</Button><Button variant="outline" disabled={busy} onClick={() => decide(false)}>Cancelar conexão</Button></div>
  </AppShell>;
}