import { createFileRoute } from "@tanstack/react-router";
import { AppShell, DisabledAction, meta } from "@/components/AppShell";
import { INTEGRATIONS, STATUS_LABEL } from "@/lib/integrations";

export const Route = createFileRoute("/integracoes")({
  head: () => meta("Integrações", "Status real das integrações e passos de configuração segura."),
  component: Integracoes,
});

function Integracoes() {
  return (
    <AppShell title="Integrações" subtitle="Nenhuma integração está conectada. Status só muda após verificação no servidor.">
      {INTEGRATIONS.map((i) => (
        <article key={i.id} className="surface p-4">
          <div className="flex items-start justify-between gap-2">
            <h2 className="font-semibold">{i.name}</h2>
            <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">{STATUS_LABEL[i.status]}</span>
          </div>
          <p className="mt-1 text-sm">{i.purpose}</p>
          {i.scopes && (
            <div className="mt-2 text-sm">
              <div>Permitido: <b>{i.scopes.allowed.join(", ")}</b></div>
              <div className="text-destructive">Bloqueado até autorização explícita: {i.scopes.blocked.join(", ")}</div>
            </div>
          )}
          {i.envVars.length > 0 && <p className="mt-2 text-xs text-muted-foreground">Variáveis de servidor: {i.envVars.map((v) => <code key={v} className="mr-1 rounded bg-muted px-1">{v}</code>)}</p>}
          <p className="mt-1 text-xs text-muted-foreground">Custo: {i.cost}</p>
          <ol className="mt-2 list-decimal pl-5 text-sm space-y-0.5">{i.steps.map((s) => <li key={s}>{s}</li>)}</ol>
          <div className="mt-3"><DisabledAction label="Conectar" why="Configuração externa desativada nesta versão inicial. Nunca pediremos senhas ou códigos." /></div>
        </article>
      ))}
    </AppShell>
  );
}
