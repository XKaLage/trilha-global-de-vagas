# Integrações — guia de configuração segura

Segredos vão somente em variáveis de ambiente do servidor (Segredos do projeto), nunca no navegador/localStorage.

| Integração | Variáveis | Escopo |
|---|---|---|
| TinyFish (busca/leitura) | `TINYFISH_API_KEY` | Apenas Search e Fetch (gratuitos dentro da cota diária). Navegador, agentes, pesquisa profunda e monitores pagos permanecem desativados |
| Banco persistente (Lovable Cloud) | `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` | Tabelas com RLS |
| Gmail | `GOOGLE_MAIL_API_KEY`, `LOVABLE_API_KEY` | Apenas `gmail.readonly`. Enviar, rascunhar, encaminhar, excluir e modificar ficam bloqueados até autorização separada |
| Notificações | `NOTIFY_WEBHOOK_URL` | Desativado por política |

## TinyFish

- Adaptador server-side em `src/lib/tinyfish.server.ts`; a chave é lida de `process.env` dentro do handler e nunca é registrada em logs, retornada ao cliente ou exibida na UI.
- Endpoints usados (contrato verificado na documentação oficial): Search `GET https://api.search.tinyfish.ai` e Fetch `POST https://api.fetch.tinyfish.ai`, ambos com header `X-API-Key`.
- Funções de servidor (`src/lib/tinyfish.functions.ts`): `getTinyfishStatus` (verificação segura), `searchJobPostings` (busca) e `fetchJobPage` (leitura de até 3 URLs públicas, texto truncado).
- A verificação de status faz uma busca mínima e traduz o resultado (configurado/verificado/erro) sem expor credenciais nem corpos de resposta.

Regras: nunca pedir senhas ou códigos de verificação; sem candidaturas reais, criação de contas, e-mails de saída, monitoramento pago ou automação de navegador nesta versão.

## Gmail — verificação de 28/10/2026

- Duas conexões de workspace disponíveis e acessíveis, ambas **não vinculadas ao projeto**. Elas não comprovam acesso em runtime do app publicado. A chave `GOOGLE_MAIL_API_KEY` também está ausente no ambiente atual; nenhum teste de credenciais do app foi executado.
- Ambas concedem `gmail.readonly`, `gmail.send`, `gmail.compose` e `gmail.modify`; não atendem ao escopo mínimo solicitado. Não foram vinculadas, alteradas ou usadas para ler mensagens.
- Ajustar a autorização em [configurações da conexão Gmail](https://lovable.dev/dashboard?connectors=&connector=google_mail&workspace=f6cc2e2e202cd66558b3) para **somente `gmail.readonly`**. Depois, confirmar os escopos novamente antes de vincular.
- O app não tem autenticação de usuário. Não criar uma função pública que exponha a caixa de entrada compartilhada: proteção CSRF não é autenticação. A leitura permanece bloqueada até existir identificação segura e autorização do usuário no servidor. Cloud/banco não foram autorizados e não foram habilitados.
- Não há adaptador de leitura ou sincronização nesta versão: nenhuma mensagem privada é retornada, classificada ou gravada. Dados locais existentes e exemplos não foram alterados.
- A API do Gmail não cobra por chamadas dentro das cotas, mas disponibilidade do conector não comprova gratuidade de toda execução/hospedagem. Nenhum serviço adicional foi contratado e nenhuma chamada à API Gmail foi feita nesta rodada.
