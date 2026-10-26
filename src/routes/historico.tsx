import { createFileRoute } from "@tanstack/react-router";
import { AppShell, DemoBadge, Empty, meta } from "@/components/AppShell";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/historico")({
  head: () => meta("Histórico", "Histórico de vagas e desempenho por versão de regras."),
  component: Historico,
});

function Historico() {
  const s = useApp();
  const perf = s.versions.map((v) => {
    const js = s.jobs.filter((j) => j.ruleVersionId === v.id);
    const ids = new Set(js.map((j) => j.employer));
    return { v, total: js.length, eligible: js.filter((j) => j.eligible).length,
      confirmed: js.filter((j) => j.status === "confirmed").length,
      responses: s.responses.filter((r) => ids.has(r.employer)).length };
  });
  return (
    <AppShell title="Histórico" subtitle="Todas as vagas avaliadas e desempenho por versão de regras.">
      <section className="surface p-4 overflow-x-auto">
        <h2 className="font-semibold">Desempenho por versão de regras</h2>
        <table className="mt-2 w-full text-sm">
          <thead className="text-left text-muted-foreground"><tr><th className="py-1">Versão</th><th>Avaliadas</th><th>Elegíveis</th><th>Confirmadas</th><th>Respostas</th></tr></thead>
          <tbody>{perf.map((p) => (
            <tr key={p.v.id} className="border-t"><td className="py-2">v{p.v.version} <span className="text-xs text-muted-foreground">({p.v.status})</span></td><td>{p.total}</td><td>{p.eligible}</td><td>{p.confirmed}</td><td>{p.responses}</td></tr>
          ))}</tbody>
        </table>
      </section>
      {s.jobs.length === 0 ? <Empty title="Histórico vazio" /> : (
        <ul className="surface divide-y">{s.jobs.map((j) => (
          <li key={j.id} className="p-3 text-sm"><b>{j.title}</b> {j.demo && <DemoBadge />}<div className="text-muted-foreground">{j.employer} · {j.status} · {new Date(j.createdAt).toLocaleString("pt-BR")}</div></li>
        ))}</ul>
      )}
    </AppShell>
  );
}
