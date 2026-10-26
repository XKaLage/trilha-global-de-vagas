import { createFileRoute } from "@tanstack/react-router";
import { AppShell, meta } from "@/components/AppShell";
import { actions, useApp } from "@/lib/store";

export const Route = createFileRoute("/configuracoes")({
  head: () => meta("Configurações", "Limite por sessão, revisão manual e dados locais."),
  component: Config,
});

function Config() {
  const s = useApp();
  return (
    <AppShell title="Configurações">
      <section className="surface p-4 space-y-3">
        <label className="text-sm block">Limite de envios por sessão
          <input className="field mt-1" type="number" min={1} max={200} value={s.session.cap}
            onChange={(e) => { const n = Number(e.target.value); if (n >= 1 && n <= 200) actions.setCap(n); }} />
        </label>
        <label className="flex items-center gap-3 text-sm min-h-[44px]">
          <input type="checkbox" className="size-5" checked={s.settings.requireManualReview} onChange={(e) => actions.setSettings({ requireManualReview: e.target.checked })} />
          Exigir revisão manual antes de cada envio
        </label>
      </section>
      <section className="surface p-4 text-sm space-y-1">
        <h2 className="font-semibold">Protótipo vs produção</h2>
        <p><b>Agora:</b> dados guardados só neste navegador (sem segredos), nenhuma ação externa.</p>
        <p><b>Produção:</b> banco persistente, segredos no servidor, integrações verificadas e autorizações explícitas.</p>
      </section>
      <button className="btn btn-danger w-full" onClick={() => { if (confirm("Apagar todos os dados locais?")) actions.resetAll(); }}>Apagar dados locais</button>
    </AppShell>
  );
}
