import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Empty, meta } from "@/components/AppShell";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/auditoria")({
  head: () => meta("Auditoria", "Registro de todas as ações do sistema e do usuário."),
  component: Auditoria,
});

function Auditoria() {
  const s = useApp();
  return (
    <AppShell title="Auditoria" subtitle="Cada ação fica registrada (últimas 500).">
      {s.audit.length === 0 ? <Empty title="Sem eventos" /> : (
        <ul className="surface divide-y">{s.audit.map((a) => (
          <li key={a.id} className="p-3 text-sm"><code className="text-primary font-semibold">{a.action}</code><div>{a.detail}</div><div className="text-xs text-muted-foreground">{new Date(a.at).toLocaleString("pt-BR")}</div></li>
        ))}</ul>
      )}
    </AppShell>
  );
}
