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
