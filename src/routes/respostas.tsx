import { createFileRoute } from "@tanstack/react-router";
import { AppShell, DemoBadge, DisabledAction, Empty, meta } from "@/components/AppShell";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/respostas")({
  head: () => meta("Respostas", "Respostas de empregadores: entrevistas, rejeições e pedidos de informação."),
  component: Respostas,
});

const KIND = { interview: "Entrevista", rejection: "Rejeição", info: "Pedido de informação", other: "Outro" } as const;
type Kind = keyof typeof KIND;

const TONE: Record<Kind, { tint: string; text: string; icon: string; badge: string }> = {
  interview: { tint: "tint-success", text: "text-tint-success", icon: "🎉", badge: "bg-success text-primary-foreground" },
  rejection: { tint: "tint-danger", text: "text-tint-danger", icon: "✕", badge: "bg-destructive text-destructive-foreground" },
  info: { tint: "tint-warning", text: "text-tint-warning", icon: "ℹ", badge: "bg-warning text-accent-foreground" },
  other: { tint: "", text: "", icon: "✉", badge: "bg-muted text-muted-foreground" },
};

function Respostas() {
  const s = useApp();
  return (
    <AppShell title="Respostas" subtitle="Detectadas futuramente via Gmail somente leitura.">
      <DisabledAction label="Sincronizar Gmail" why="Gmail ainda não conectado. Será somente leitura (gmail.readonly)." />
      {s.responses.length === 0 ? <Empty title="Nenhuma resposta" hint="Nenhuma resposta real foi detectada." /> :
        s.responses.map((r) => {
          const t = TONE[r.kind as Kind] ?? TONE.other;
          return (
            <article key={r.id} tabIndex={0} className={`surface p-4 lift ${t.tint} outline-none focus-visible:ring-2 focus-visible:ring-ring`}>
              <div className="flex items-center gap-2">
                <span aria-hidden className={`grid size-7 shrink-0 place-items-center rounded-full text-sm font-bold ${t.badge}`}>{t.icon}</span>
                <h3 className={`font-semibold ${t.text}`}>{KIND[r.kind as Kind]} — {r.employer} {r.demo && <DemoBadge />}</h3>
              </div>
              <p className="mt-1.5 text-sm">{r.summary}</p>
              <p className="mt-1 text-xs text-muted-foreground">{new Date(r.receivedAt).toLocaleString("pt-BR")}</p>
            </article>
          );
        })}
      <DisabledAction label="Responder ao empregador" why="Envio de e-mails desativado; exige autorização separada e explícita." />
    </AppShell>
  );
}
