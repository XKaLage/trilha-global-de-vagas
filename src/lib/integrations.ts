// Modular integration adapters. Every status is truthful: nothing is "connected"
// until a server-side verification succeeds. Secrets live only in server env vars.
export type IntegrationStatus = "not_configured" | "planned" | "pending" | "disabled_by_policy";

export type Integration = {
  id: string; name: string; purpose: string; status: IntegrationStatus;
  envVars: string[]; cost: string; scopes?: { allowed: string[]; blocked: string[] };
  steps: string[];
};

export const INTEGRATIONS: Integration[] = [
  {
    id: "tinyfish", name: "TinyFish — busca e leitura de páginas", status: "planned",
    purpose: "Pesquisar vagas e ler páginas (somente leitura). Navegador, agentes, pesquisa profunda e monitores pagos permanecem desativados.",
    envVars: ["TINYFISH_API_KEY"], cost: "Busca e leitura são gratuitas dentro de uma cota diária; além dela, cobrança por uso do provedor.",
    steps: ["Chave TINYFISH_API_KEY guardada nos Segredos do projeto (servidor)", "Verificação de conexão disponível abaixo — nunca exibe a chave", "Apenas busca/leitura ativas; navegador e agentes exigem nova autorização"],
  },
  {
    id: "database", name: "Banco de dados persistente", status: "not_configured",
    purpose: "Guardar vagas, regras e auditoria entre dispositivos. Hoje os dados ficam apenas neste navegador (sem segredos).",
    envVars: ["SUPABASE_URL", "SUPABASE_PUBLISHABLE_KEY"], cost: "Lovable Cloud: incluso com limites de uso.",
    steps: ["Ativar Lovable Cloud", "Criar tabelas com RLS", "Migrar dados locais"],
  },
  {
    id: "gmail", name: "Gmail (somente leitura)", status: "pending",
    purpose: "Leitura de respostas de empregadores pendente. As conexões do Lovable não estão vinculadas ao app; nenhuma mensagem é lida.",
    envVars: ["GOOGLE_MAIL_API_KEY", "LOVABLE_API_KEY"], cost: "Sem custo da API do Gmail dentro das cotas.",
    scopes: {
      allowed: ["gmail.readonly"],
      blocked: ["Enviar", "Criar rascunhos", "Encaminhar", "Excluir", "Modificar/rotular"],
    },
    steps: ["Ajustar a autorização existente para apenas gmail.readonly", "Proteger o acesso privado às mensagens antes de vincular a conexão ao projeto", "Verificar a conexão no servidor do app antes de liberar leitura", "Filtrar por remetentes de vagas conhecidas; nenhuma escrita em e-mails autorizada"],
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
  pending: "Pendente no app",
  not_configured: "Não configurado",
  planned: "Planejado",
  disabled_by_policy: "Desativado por política",
};
