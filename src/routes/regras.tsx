import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, meta } from "@/components/AppShell";
import { actions, useApp } from "@/lib/store";
import { CRITERIA_LABELS, defaultRules, evaluate, type CriterionMode, type Job, type RuleSet } from "@/lib/rules";
import { JobEvaluation } from "@/components/JobEvaluation";

export const Route = createFileRoute("/regras")({
  head: () => meta("Regras", "Editor de regras com bloqueios, preferências ponderadas e versões."),
  component: Regras,
});

const list = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

function Regras() {
  const s = useApp();
  const latest = s.versions[0];
  const [rules, setRules] = useState<RuleSet>(latest?.rules ?? defaultRules());
  const [note, setNote] = useState("");
  const [testId, setTestId] = useState<string>();
  useEffect(() => { if (latest) setRules(latest.rules); }, [latest?.id]);

  const setC = <K extends keyof RuleSet>(k: K, p: Partial<RuleSet[K]>) => setRules({ ...rules, [k]: { ...rules[k], ...p } });
  const testV = s.versions.find((v) => v.id === testId);

  const valueInput = (k: keyof RuleSet) => {
    const c = rules[k];
    if (Array.isArray(c.value)) return <input className="field" aria-label={`${CRITERIA_LABELS[k]} valores`} placeholder="separados por vírgula" defaultValue={(c.value as string[]).join(", ")} onBlur={(e) => setC(k, { value: list(e.target.value) } as never)} />;
    if (typeof c.value === "number") return <input className="field" inputMode="decimal" aria-label={`${CRITERIA_LABELS[k]} valor`} value={c.value} onChange={(e) => setC(k, { value: Number(e.target.value) } as never)} />;
    return <select className="field" aria-label={`${CRITERIA_LABELS[k]} valor`} value={c.value ? "sim" : "nao"} onChange={(e) => setC(k, { value: e.target.value === "sim" } as never)}><option value="sim">Exigir sim</option><option value="nao">Exigir não</option></select>;
  };

  return (
    <AppShell title="Regras" subtitle="Bloqueios eliminam a vaga; preferências somam pontos. Rascunho → Teste → Ativa.">
      <section className="surface p-4 space-y-4">
        {(Object.keys(rules) as (keyof RuleSet)[]).map((k) => (
          <div key={k} className="grid gap-2 md:grid-cols-[1fr_140px_90px] items-end border-b pb-3 last:border-0">
            <div><div className="text-sm font-semibold mb-1">{CRITERIA_LABELS[k]}</div>{valueInput(k)}</div>
            <select className="field" aria-label={`${CRITERIA_LABELS[k]} modo`} value={rules[k].mode} onChange={(e) => setC(k, { mode: e.target.value as CriterionMode })}>
              <option value="off">Ignorar</option><option value="blocker">Bloqueio</option><option value="preference">Preferência</option>
            </select>
            <input className="field" aria-label={`${CRITERIA_LABELS[k]} peso`} inputMode="numeric" disabled={rules[k].mode !== "preference"} value={rules[k].weight} onChange={(e) => setC(k, { weight: Number(e.target.value) })} />
          </div>
        ))}
        <input className="field" placeholder="Nota da versão" value={note} onChange={(e) => setNote(e.target.value)} />
        <button className="btn btn-primary w-full" onClick={() => { actions.saveDraft(rules, note); setNote(""); }}>Salvar como novo rascunho</button>
      </section>

      <section className="surface p-4">
        <h2 className="font-semibold">Versões</h2>
        <ul className="mt-2 divide-y">{s.versions.map((v) => (
          <li key={v.id} className="py-3 flex flex-wrap items-center gap-2">
            <div className="flex-1 min-w-[140px]"><b>v{v.version}</b> <span className="text-xs rounded bg-muted px-1.5 py-0.5">{v.status}</span><div className="text-xs text-muted-foreground">{v.note || "—"} · {new Date(v.createdAt).toLocaleString("pt-BR")}</div></div>
            {v.status === "draft" && <button className="btn btn-ghost" onClick={() => actions.setVersionStatus(v.id, "testing")}>Testar</button>}
            {v.status === "testing" && <button className="btn btn-ghost" onClick={() => setTestId(v.id)}>Ver teste</button>}
            {v.status === "testing" && <button className="btn btn-primary" onClick={() => { actions.setVersionStatus(v.id, "active"); actions.reevaluate(); }}>Ativar</button>}
            {v.status === "archived" && <button className="btn btn-ghost" onClick={() => { actions.rollback(v.id); actions.reevaluate(); }}>Rollback</button>}
          </li>
        ))}</ul>
      </section>

      {testV && (
        <section className="surface p-4">
          <h2 className="font-semibold">Teste de v{testV.version} contra vagas registradas</h2>
          {s.jobs.length === 0 ? <p className="text-sm text-muted-foreground mt-1">Sem vagas para testar.</p> :
            s.jobs.map((j: Job) => (
              <div key={j.id} className="mt-2 text-sm border-t pt-2"><b>{j.title}</b><JobEvaluation job={j} version={testV} /></div>
            ))}
        </section>
      )}
    </AppShell>
  );
}
