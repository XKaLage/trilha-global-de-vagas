import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { AppShell, DemoBadge, DisabledAction, Empty, meta } from "@/components/AppShell";
import { actions, useApp } from "@/lib/store";
import { searchJobPostings } from "@/lib/tinyfish.functions";

export const Route = createFileRoute("/vagas")({
  head: () => meta("Vagas", "Vagas descobertas, elegibilidade e motivos de correspondência."),
  component: Vagas,
});

const tri = (v: string) => (v === "" ? undefined : v === "sim");

const SEARCH_ERR: Record<string, string> = {
  not_configured: "TinyFish não configurado: adicione TINYFISH_API_KEY nos Segredos do projeto.",
  unauthorized: "Chave da TinyFish rejeitada pelo provedor. Verifique o segredo.",
  network: "Falha de rede ao consultar a TinyFish. Tente novamente.",
};

type Hit = { title: string; url: string; snippet: string; siteName?: string };

function Vagas() {
  const s = useApp();
  const [f, setF] = useState({ url: "", employer: "", title: "", location: "", country: "US", pay: "", exp: "", housing: "", visa: "", intl: "", description: "" });
  const [msg, setMsg] = useState<string>();
  const [q, setQ] = useState("");
  const [country, setCountry] = useState<"US" | "CA">("US");
  const [hits, setHits] = useState<Hit[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchMsg, setSearchMsg] = useState<string>();
  const [copiedUrl, setCopiedUrl] = useState<string>();
  const formRef = useRef<HTMLFormElement>(null);
  const up = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim().length < 3) return setSearchMsg("Digite pelo menos 3 caracteres.");
    setSearching(true);
    setSearchMsg(undefined);
    try {
      const r = await searchJobPostings({ data: { query: q.trim(), country } });
      if (r.ok) {
        setHits(r.results);
        setSearchMsg(r.results.length ? undefined : "Nenhum resultado encontrado.");
      } else {
        setHits([]);
        setSearchMsg(SEARCH_ERR[r.error ?? ""] ?? `Erro do provedor (${r.error}).`);
      }
    } catch {
      setSearchMsg("Falha ao consultar o servidor.");
    } finally {
      setSearching(false);
    }
  };

  const importHit = (h: Hit) => {
    setF({ ...f, url: h.url, title: h.title, employer: h.siteName ?? "", country, description: h.snippet });
    setCopiedUrl(h.url);
    setMsg("Resultado copiado para o formulário. Revise os campos e toque em Registrar e avaliar.");
    // Aguarda o próximo frame para o estado aplicar antes de rolar até o formulário.
    requestAnimationFrame(() =>
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.url || !f.employer || !f.title) return setMsg("Preencha URL, empregador e título.");
    const r = actions.addJob({
      demo: false, url: f.url, employer: f.employer, title: f.title, location: f.location, country: f.country,
      payHourlyUsd: f.pay ? Number(f.pay) : undefined, experienceYears: f.exp ? Number(f.exp) : undefined,
      housing: tri(f.housing), visaSponsorship: tri(f.visa), internationalOk: tri(f.intl), description: f.description,
    });
    setMsg(r.ok ? "Vaga registrada e avaliada." : r.reason);
    if (r.ok) {
      setF({ ...f, url: "", employer: "", title: "", description: "" });
      setCopiedUrl(undefined);
    }
  };

  const sel = (k: "housing" | "visa" | "intl", label: string) => (
    <label className="text-sm">{label}
      <select className="field mt-1" value={f[k]} onChange={up(k)}><option value="">Não informado</option><option value="sim">Sim</option><option value="nao">Não</option></select>
    </label>
  );

  return (
    <AppShell title="Vagas" subtitle="Busca somente leitura via TinyFish. Nenhuma candidatura é enviada.">
      <form onSubmit={search} className="surface p-4 grid gap-3">
        <h2 className="font-semibold">Buscar vagas (TinyFish · somente leitura)</h2>
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <label className="text-sm">Termo de busca
            <input className="field mt-1" placeholder="ex.: line cook visa sponsorship" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
          <label className="text-sm">País
            <select className="field mt-1" value={country} onChange={(e) => setCountry(e.target.value as "US" | "CA")}>
              <option value="US">EUA</option><option value="CA">Canadá</option>
            </select>
          </label>
          <button className="btn btn-primary self-end" disabled={searching}>{searching ? "Buscando…" : "Buscar"}</button>
        </div>
        {searchMsg && <p role="status" className="text-sm">{searchMsg}</p>}
        {hits.length > 0 && (
          <ul className="space-y-2">
            {hits.map((h) => (
              <li key={h.url} className="surface lift p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <a href={h.url} target="_blank" rel="noreferrer" className="font-semibold underline break-words">{h.title}</a>
                    {h.siteName && <span className="ml-2 text-xs text-muted-foreground">{h.siteName}</span>}
                    {h.snippet && <p className="mt-1 text-sm text-muted-foreground">{h.snippet}</p>}
                  </div>
                  <button type="button" className="btn btn-ghost shrink-0" onClick={() => importHit(h)}>
                    {copiedUrl === h.url ? "✓ Copiado" : "Usar no formulário"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </form>
      <form ref={formRef} onSubmit={submit} className="surface scroll-mt-4 p-4 grid gap-3 md:grid-cols-2">
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
      {s.jobs.length === 0 ? <Empty title="Nenhuma vaga registrada" hint="Busque acima, adicione manualmente ou carregue exemplos na Visão Geral." /> :
        s.jobs.map((j) => (
          <article key={j.id} className={`surface p-4 lift ${j.eligible ? "tint-success" : "tint-danger"}`}>
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
