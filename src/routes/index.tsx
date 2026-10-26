import { createFileRoute } from "@tanstack/react-router";
import { AppShell, meta } from "@/components/AppShell";
import { actions, activeVersion, counters, useApp } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => meta("Visão Geral", "Painel de sessão e contadores de candidaturas para EUA e Canadá (protótipo)."),
  component: Overview,
});

function Overview() {
  const s = useApp();
  const c = counters(s);
  const av = activeVersion(s);
  const st = s.session.status;
  const cards: [string, number, string][] = [
    ["Descobertas", c.discovered, "Vagas encontradas/registradas"],
    ["Elegíveis", c.eligible, "Passaram nos bloqueios"],
    ["Na fila", c.queued, "Aguardando envio"],
    ["Tentadas", c.attempted, "Envio iniciado"],
    ["Confirmadas", c.confirmed, "Envio confirmado pelo site"],
    ["Incertas", c.uncertain, "Sem confirmação clara"],
    ["Falhas", c.failed, "Erro no envio"],
    ["Respostas", c.responses, "Retornos de empregadores"],
  ];
  return (
    <AppShell title="Visão Geral" subtitle="EUA e Canadá · nenhuma candidatura real é enviada nesta versão">
      <section className="surface p-4" aria-labelledby="sess">
        <div className="flex items-center justify-between">
          <h2 id="sess" className="font-semibold">Sessão</h2>
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${st === "running" ? "bg-success text-primary-foreground" : st === "paused" ? "bg-warning text-accent-foreground" : "bg-muted text-muted-foreground"}`}>
            {st === "running" ? "Em execução (simulada)" : st === "paused" ? "Pausada" : "Parada"}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Limite: <b>{s.session.cap}</b> envios por sessão · Usados: {s.session.submitted}/{s.session.cap} · Regras: {av ? `v${av.version}` : "nenhuma versão ativa"}
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <button className="btn btn-primary" onClick={actions.start} disabled={st !== "idle" || !av}>Iniciar</button>
          <button className="btn btn-ghost" onClick={actions.pause} disabled={st !== "running"}>Pausar</button>
          <button className="btn btn-ghost" onClick={actions.resume} disabled={st !== "paused"}>Retomar</button>
        </div>
        {st !== "idle" && <button className="btn btn-ghost mt-2 w-full" onClick={actions.stop}>Encerrar sessão</button>}
        {!av && <p className="mt-2 text-xs text-destructive">Ative uma versão de regras em “Regras” para iniciar.</p>}
        <p className="mt-2 text-xs text-muted-foreground">No protótipo, a sessão apenas registra eventos na auditoria. Envio automático desativado.</p>
      </section>
      <section aria-label="Contadores" className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {cards.map(([l, v, h]) => (
          <div key={l} className="surface p-3">
            <div className="text-xs text-muted-foreground">{l}</div>
            <div className="font-display text-3xl font-bold">{v}</div>
            <div className="text-[11px] text-muted-foreground">{h}</div>
          </div>
        ))}
      </section>
      <section className="surface p-4">
        <h2 className="font-semibold">Custos</h2>
        <p className="mt-1 text-sm text-muted-foreground">Custo atual de integrações: <b>US$ 0</b> — nenhuma integração paga está ativa. Busca (TinyFish) e banco terão custos por uso exibidos antes de ativar.</p>
      </section>
      <section className="surface p-4 flex flex-wrap gap-2">
        <button className="btn btn-ghost" onClick={actions.loadDemo}>Carregar dados de exemplo</button>
        <button className="btn btn-ghost" onClick={actions.clearDemo}>Remover exemplos</button>
      </section>
    </AppShell>
  );
}
