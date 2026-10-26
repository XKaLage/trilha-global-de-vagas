// Modular integration adapters. Every status is truthful: nothing is "connected"
// until a server-side verification succeeds. Secrets live only in server env vars.
export type IntegrationStatus = "not_configured" | "planned" | "disabled_by_policy";

export type Integration = {
  id: string; name: string; purpose: string; status: IntegrationStatus;
  envVars: string[]; cost: string; scopes?: { allowed: string[]; blocked: string[] };
  steps: string[];
};

export const INTEGRATIONS: Integration[] = [
  {
    id: "tinyfish", name: "TinyFish — busca, fetch e navegador", status: "not_configured",
    purpose: "Pesquisar e ler páginas de vagas. Automação de navegador desativada nesta versão.",
    envVars: ["TINYFISH_API_KEY"], cost: "Cobrança por uso do provedor (verificar tabela oficial antes de ativar).",
    steps: ["Criar conta no provedor e gerar chave", "Adicionar TINYFISH_API_KEY em Segredos do projeto (servidor)", "Implementar verificação no servidor", "Ativar apenas busca/fetch; navegador exige nova autorização"],
  },
  {
    id: "database", name: "Banco de dados persistente", status: "not_configured",
    purpose: "Guardar vagas, regras e auditoria entre dispositivos. Hoje os dados ficam apenas neste navegador (sem segredos).",
    envVars: ["SUPABASE_URL", "SUPABASE_PUBLISHABLE_KEY"], cost: "Lovable Cloud: incluso com limites de uso.",
    steps: ["Ativar Lovable Cloud", "Criar tabelas com RLS", "Migrar dados locais"],
  },
  {
    id: "gmail", name: "Gmail (somente leitura)", status: "planned",
    purpose: "Detectar respostas de empregadores: entrevistas, rejeições, pedidos de informação.",
    envVars: ["GOOGLE_MAIL_API_KEY", "LOVABLE_API_KEY"], cost: "Sem custo da API do Gmail dentro das cotas.",
    scopes: {
      allowed: ["gmail.readonly"],
      blocked: ["Enviar", "Criar rascunhos", "Encaminhar", "Excluir", "Modificar/rotular"],
    },
    steps: ["Conectar via OAuth (nunca senha ou código)", "Conceder apenas gmail.readonly", "Filtrar por remetentes de vagas conhecidas", "Envio/modificação exigem autorização separada e explícita"],
  },
  {
    id: "sources", name: "Fontes de vagas", status: "not_configured",
    purpose: "Portais e sites de empregadores nos EUA e Canadá (ex.: Job Bank, sites oficiais).",
    envVars: [], cost: "Depende da fonte; nenhuma fonte paga ativada.",
    steps: ["Listar fontes permitidas", "Respeitar termos de uso e robots.txt", "Sem criação de contas em sites de terceiros"],
  },
  {
    id: "notifications", name: "Notificações (opcional)", status: "disabled_by_policy",
    purpose: "Alertas de respostas. E-mails de saída estão desativados nesta versão.",
    envVars: ["NOTIFY_WEBHOOK_URL"], cost: "Nenhum monitoramento pago ativado.",
    steps: ["Escolher canal", "Autorizar explicitamente envio de alertas"],
  },
];

export const STATUS_LABEL: Record<IntegrationStatus, string> = {
  not_configured: "Não configurado",
  planned: "Planejado",
  disabled_by_policy: "Desativado por política",
};
