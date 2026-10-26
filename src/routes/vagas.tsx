import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, DemoBadge, DisabledAction, Empty, meta } from "@/components/AppShell";
import { actions, useApp } from "@/lib/store";

export const Route = createFileRoute("/vagas")({
  head: () => meta("Vagas", "Vagas descobertas, elegibilidade e motivos de correspondência."),
  component: Vagas,
});

const tri = (v: string) => (v === "" ? undefined : v === "sim");

function Vagas() {
  const s = useApp();
  const [f, setF] = useState({ url: "", employer: "", title: "", location: "", country: "US", pay: "", exp: "", housing: "", visa: "", intl: "", description: "" });
  const [msg, setMsg] = useState<string>();
  const up = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.url || !f.employer || !f.title) return setMsg("Preencha URL, empregador e título.");
    const r = actions.addJob({
      demo: false, url: f.url, employer: f.employer, title: f.title, location: f.location, country: f.country,
      payHourlyUsd: f.pay ? Number(f.pay) : undefined, experienceYears: f.exp ? Number(f.exp) : undefined,
      housing: tri(f.housing), visaSponsorship: tri(f.visa), internationalOk: tri(f.intl), description: f.description,
    });
    setMsg(r.ok ? "Vaga registrada e avaliada." : r.reason);
    if (r.ok) setF({ ...f, url: "", employer: "", title: "", description: "" });
  };

  const sel = (k: "housing" | "visa" | "intl", label: string) => (
    <label className="text-sm">{label}
      <select className="field mt-1" value={f[k]} onChange={up(k)}><option value="">Não informado</option><option value="sim">Sim</option><option value="nao">Não</option></select>
    </label>
  );

  return (
    <AppShell title="Vagas" subtitle="Registro manual. Busca automática desativada até a integração ser verificada.">
      <DisabledAction label="Buscar vagas automaticamente" why="TinyFish não configurado e busca externa desativada nesta versão inicial." />
      <form onSubmit={submit} className="surface p-4 grid gap-3 md:grid-cols-2">
        <h2 className="font-semibold md:col-span-2">Adicionar vaga manualmente</h2>
        <label className="text-sm md:col-span-2">URL<input className="field mt-1" inputMode="url" value={f.url} onChange={up("url")} /></label>
        <label className="text-sm">Empregador<input className="field mt-1" value={f.employer} onChange={up("employer")} /></label>
        <label className="text-sm">Título<input className="field mt-1" value={f.title} onChange={up("title")} /></label>
        <label className="text-sm">Local<input className="field mt-1" value={f.location} onChange={up("location")} /></label>
        <label className="text-sm">País<select className="field mt-1" value={f.country} onChange={up("country")}><option value="US">EUA</option><option value="CA">Canadá</option></select></label>
        <label className="text-sm">Pagamento (USD/h)<input className="field mt-1" inputMode="decimal" value={f.pay} onChange={up("pay")} /></label>
        <label className="text-sm">Experiência exigida (anos)<input className="field mt-1" inputMode="numeric" value={f.exp} onChange={up("exp")} /></label>
        {sel("housing", "Moradia")}{sel("visa", "Patrocínio de visto")}{sel("intl", "Aceita internacionais")}
        <label className="text-sm md:col-span-2">Descrição<textarea className="field mt-1" rows={3} value={f.description} onChange={up("description")} /></label>
        <button className="btn btn-primary md:col-span-2">Registrar e avaliar</button>
        {msg && <p role="status" className="text-sm md:col-span-2">{msg}</p>}
      </form>
      {s.jobs.length === 0 ? <Empty title="Nenhuma vaga registrada" hint="Adicione manualmente ou carregue exemplos na Visão Geral." /> :
        s.jobs.map((j) => (
          <article key={j.id} className="surface p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold">{j.title} {j.demo && <DemoBadge />}</h3>
                <p className="text-sm text-muted-foreground">{j.employer} · {j.location} · {j.country}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${j.eligible ? "bg-success text-primary-foreground" : "bg-destructive text-destructive-foreground"}`}>
                {j.eligible ? `Elegível · ${j.score}%` : "Rejeitada"}
              </span>
            </div>
            <ul className="mt-2 space-y-0.5 text-sm">{j.reasons?.map((r, i) => <li key={i}>{r}</li>)}</ul>
            <p className="mt-1 text-xs text-muted-foreground">Status: {j.status} · regras {j.ruleVersionId ?? "—"}</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button className="btn btn-ghost" disabled={!j.eligible || j.status !== "discovered"} onClick={() => actions.queueJob(j.id)}>Pôr na fila</button>
              <button className="btn btn-ghost" onClick={() => actions.removeJob(j.id)}>Remover</button>
            </div>
            <div className="mt-2"><DisabledAction label="Enviar candidatura" why="Candidaturas reais desativadas nesta versão inicial." /></div>
          </article>
        ))}
    </AppShell>
  );
}
