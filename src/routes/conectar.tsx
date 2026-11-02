import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, meta } from "@/components/AppShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/conectar")({
  head: () => meta("Conectar agente", "Como conectar ChatGPT, Claude ou outro assistente de IA à Trilha Global de Vagas via MCP."),
  component: Conectar,
});

const APP_NAME = "Trilha Global de Vagas";
const APP_SLUG = "trilha-global-de-vagas";

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };
  return (
    <Button variant="outline" size="sm" onClick={copy} disabled={!text} aria-live="polite">
      {copied ? "✓ Copiado" : label}
    </Button>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-2 text-sm">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{n}</span>
      <span className="min-w-0">{children}</span>
    </li>
  );
}

function Conectar() {
  const [mcpUrl, setMcpUrl] = useState("");
  useEffect(() => {
    setMcpUrl(new URL("/mcp", window.location.origin).toString());
  }, []);

  const claudeUrl = `https://claude.ai/customize/connectors?modal=add-custom-connector&connectorName=${encodeURIComponent(APP_NAME)}&connectorUrl=${encodeURIComponent(mcpUrl)}`;
  const claudeCodeCmd = `claude mcp add --scope user --transport http ${APP_SLUG} '${mcpUrl.replace(/'/g, "'\\''")}'`;

  return (
    <AppShell title="Conectar agente" subtitle="Conecte um assistente de IA às suas vagas e regras persistentes. A conexão é protegida: o assistente entra com a sua conta e só faz consultas de leitura.">
      <section className="surface p-4 lift">
        <h2 className="font-semibold">Endereço do servidor</h2>
        <p className="mt-1 text-sm text-muted-foreground">Copie este endereço — ele é o mesmo em qualquer assistente.</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <code className="min-w-0 flex-1 break-all rounded bg-muted px-2 py-1.5 text-sm">{mcpUrl || "Carregando…"}</code>
          <CopyButton text={mcpUrl} label="Copiar endereço" />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Ao conectar, o assistente pedirá sua autorização na tela de consentimento deste app. Sem conta provisionada e login privado ativo, a conexão ainda não conclui.</p>
      </section>

      <section className="surface p-4 lift">
        <h2 className="font-semibold">ChatGPT</h2>
        <ol className="mt-2 space-y-2">
          <Step n={1}>Abra as <a className="text-primary underline" href="https://chatgpt.com/#settings/Connectors/Advanced" target="_blank" rel="noreferrer">configurações de conectores do ChatGPT</a> e ative o modo Desenvolvedor. Se não aparecer, peça a um administrador do ChatGPT para ativar.</Step>
          <Step n={2}>Abra a <a className="text-primary underline" href="https://chatgpt.com/plugins#settings/Connectors?create-connector=true&redirectAfter=%2Fplugins" target="_blank" rel="noreferrer">criação de novo conector</a>.</Step>
          <Step n={3}>No nome, escreva <b>{APP_NAME}</b>; no endereço, cole o endereço do servidor copiado acima.</Step>
          <Step n={4}>Revise os detalhes, marque "I understand and want to continue" (o ChatGPT mostra esse aviso para todo conector personalizado) e clique em "Create".</Step>
          <Step n={5}>Ative o conector no compositor da conversa e peça ao ChatGPT para usar o app.</Step>
        </ol>
      </section>

      <section className="surface p-4 lift">
        <h2 className="font-semibold">Claude</h2>
        <ol className="mt-2 space-y-2">
          <Step n={1}>Abra o <a className="text-primary underline" href={claudeUrl} target="_blank" rel="noreferrer">formulário de conector do Claude</a> — ele já abre com nome e endereço preenchidos.</Step>
          <Step n={2}>Revise os detalhes e clique em "Add".</Step>
          <Step n={3}>Se o formulário não abrir preenchido, vá em Connectors, escolha "Add custom connector", dê o nome e cole o endereço do servidor.</Step>
          <Step n={4}>Ative o conector no compositor da conversa e peça ao Claude para usar o app.</Step>
        </ol>
      </section>

      <section className="surface p-4 lift">
        <h2 className="font-semibold">Claude Code</h2>
        <ol className="mt-2 space-y-2">
          <Step n={1}>Execute este comando no terminal:
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <code className="min-w-0 flex-1 break-all rounded bg-muted px-2 py-1.5 text-xs">{claudeCodeCmd}</code>
              <CopyButton text={claudeCodeCmd} label="Copiar comando" />
            </div>
          </Step>
          <Step n={2}>Abra o Claude Code e rode <code className="rounded bg-muted px-1">/mcp</code> para confirmar a conexão. Como este app protege suas ferramentas, ele pedirá seu login nesse momento.</Step>
          <Step n={3}>Peça ao Claude Code para usar o app.</Step>
        </ol>
      </section>

      <section className="surface p-4 lift">
        <h2 className="font-semibold">Outros assistentes com MCP</h2>
        <ol className="mt-2 space-y-2">
          <Step n={1}>Abra as configurações de servidores MCP ou conectores personalizados do assistente.</Step>
          <Step n={2}>Crie uma conexão de servidor MCP remoto.</Step>
          <Step n={3}>Dê um nome e cole o endereço do servidor.</Step>
          <Step n={4}>Conclua os avisos de login ou autorização.</Step>
          <Step n={5}>Ative a conexão e peça ao assistente para usar o app.</Step>
        </ol>
      </section>

      <section className="surface p-4 lift">
        <h2 className="font-semibold">Depois que o app mudar</h2>
        <p className="mt-1 text-sm text-muted-foreground">O assistente guarda a lista de ferramentas. Quando o app for atualizado e republicado, atualize a conexão:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          <li><b>ChatGPT:</b> abra a página de Plugins, selecione este app, role até "Information" e clique em "Refresh". Se o endereço mudou, apague o app e repita a conexão.</li>
          <li><b>Claude:</b> abra Connectors, selecione este conector e atualize as ferramentas. Se o endereço mudou, remova e repita a conexão.</li>
          <li><b>Claude Code:</b> inicie uma nova sessão — ele carrega as ferramentas mais recentes ao conectar. Se o endereço mudou, rode <code className="rounded bg-muted px-1">claude mcp remove {APP_SLUG}</code> e depois o comando de instalação novamente.</li>
          <li><b>Outros:</b> abra as configurações do servidor MCP, selecione a conexão e atualize a lista de ferramentas ou reconecte.</li>
        </ul>
      </section>
    </AppShell>
  );
}
