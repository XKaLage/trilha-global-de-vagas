import { createFileRoute } from "@tanstack/react-router";
import { AppShell, DemoBadge, DisabledAction, Empty, meta } from "@/components/AppShell";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/respostas")({
  head: () => meta("Respostas", "Respostas de empregadores: entrevistas, rejeições e pedidos de informação."),
  component: Respostas,
});

const KIND = { interview: "Entrevista", rejection: "Rejeição", info: "Pedido de informação", other: "Outro" };

function Respostas() {
  const s = useApp();
  return (
    <AppShell title="Respostas" subtitle="Detectadas futuramente via Gmail somente leitura.">
      <DisabledAction label="Sincronizar Gmail" why="Gmail ainda não conectado. Será somente leitura (gmail.readonly)." />
      {s.responses.length === 0 ? <Empty title="Nenhuma resposta" hint="Nenhuma resposta real foi detectada." /> :
        s.responses.map((r) => (
          <article key={r.id} className="surface p-4">
            <h3 className="font-semibold">{KIND[r.kind]} — {r.employer} {r.demo && <DemoBadge />}</h3>
            <p className="text-sm">{r.summary}</p>
            <p className="text-xs text-muted-foreground">{new Date(r.receivedAt).toLocaleString("pt-BR")}</p>
          </article>
        ))}
      <DisabledAction label="Responder ao empregador" why="Envio de e-mails desativado; exige autorização separada e explícita." />
    </AppShell>
  );
}
