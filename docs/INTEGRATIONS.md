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

## Gmail — histórico de verificação e estado atual

- A última verificação anterior encontrou três conexões de workspace sem vínculo ao projeto, com permissões além de readonly. Isso não comprova acesso em runtime. Nenhuma conexão foi consultada, alterada ou utilizada nesta entrega.
- Ajustar a autorização em [configurações da conexão Gmail](https://lovable.dev/dashboard?connectors=&connector=google_mail&workspace=f6cc2e2e202cd66558b3) para **somente `gmail.readonly`**. Depois, confirmar os escopos novamente antes de vincular.
- Cloud/banco foram autorizados e habilitados em 01/11/2026. A fundação de acesso privado existe em /auth, mas nenhum método de login ou conta foi ativado/criado. Gmail segue bloqueado até haver login operacional, autorização individual no servidor e verificação runtime de vínculo e escopo mínimo. CSRF não é autenticação.
- Não há adaptador de leitura ou sincronização nesta versão: nenhuma mensagem privada é retornada, classificada ou gravada. Dados locais existentes e exemplos não foram alterados.
- A API do Gmail não cobra por chamadas dentro das cotas, mas disponibilidade do conector não comprova gratuidade de toda execução/hospedagem. Nenhum serviço adicional foi contratado e nenhuma chamada à API Gmail foi feita nesta rodada.

## Fundação persistente — 01/11/2026

- Migrations versionadas em `drizzle/migrations/`: esquema relacional e comandos seguros; sem seeds ou dados pessoais. Tipos gerados pela integração existente.
- Tabelas: `profiles` (ponte para auth.users), `user_roles`, `candidate_profiles`, `candidate_experiences`, `candidate_education`, `candidate_certifications`, `candidate_documents`, `job_sources`, `jobs`, `job_evaluations`, `rule_sets`, `applications`, `employer_messages`, `audit_events`. Todas com RLS e grants explícitos, nenhum acesso anônimo aos registros.
- `candidate_profiles.owner_id` referencia `public.profiles`, que referencia `auth.users` com cascade. Campos profissionais e sponsorship permitem null/unknown. Nenhum perfil real criado.
- Fontes são catálogo compartilhado curado; apenas fontes permitidas são visíveis para candidatos. Jobs são privados por conta, com unique(owner_id,dedup_key) e fingerprint. As funções server-side preservam normalizeUrl/fingerprint/evaluate existentes.
- Relações compostas impedem associar experiências, avaliações, mensagens ou candidaturas a vagas/candidatos de outra conta. Uma versão ativa de regras por candidato; mudança de versão serializada.
- Documentos: apenas metadados e caminho privado preparados. Bucket e upload NÃO criados por falta de confirmação de custo/franquia. Escritas diretas de metadados bloqueadas.
- Candidaturas: autorização explícita registra auth.uid(), momento e justificativa. Escritas diretas bloqueadas; submitted/confirmed/uncertain/failed bloqueados por trigger, inclusive para service-role. Nenhum executor externo foi criado.
- Audit contém somente operação/estado/versão/classificação permitidos; sem corpo de e-mail, tokens ou detalhes de CV. Metadados Gmail sem coluna de corpo completo; nenhuma sincronização.
- `src/lib/persistence.functions.ts` centraliza leitura paginada, cadastro de vaga, rascunhos, versões, avaliação e seleção/autorização local ao banco. Todos os dados privados exigem requireSupabaseAuth. `foundation_health` revela só flags constantes, sem dados pessoais.

### Provisionamento privado e primeiro admin

Nenhum cadastro público foi aberto, nenhuma conta criada, nenhum provider ativado. A configuração hospedada de métodos de login não foi alterada nem verificada. Uma barreira independente BEFORE INSERT em auth.users rejeita registros sem `raw_app_meta_data.foundation_provisioned = true`; esse valor só pode ser atribuído por provisionamento confiável de servidor. Não usar user_metadata.

O operador autorizado deve, em trabalho futuro explicitamente autorizado, usar a API administrativa de Auth no servidor para provisionar a identidade com `app_metadata: { foundation_provisioned: true }` (sem registrar senha/tokens). O trigger cria profiles, papel candidate e perfil profissional vazio. Para o primeiro admin, um operador confiável deve também definir `app_metadata.role = admin` e inserir a linha admin em public.user_roles pela via administrativa; a função foundation_admin exige AMBOS. Não há botão de promoção ou política de escrita de papéis no frontend, nem promoção do primeiro usuário. A rota /auth verifica uma sessão já existente; o fluxo de obtenção de sessão fica pendente até escolher/autorizar o método de entrada. Não solicitar credenciais em chat.

### Dados locais e migração futura

`rci-state-v1` e store.ts permanecem intactos; nenhuma tela foi trocada para leitura persistente. Não há importador automático. Antes da futura migração: exportar os bytes originais para download e backup com checksum; confirmar conta-alvo e consentimento; validar versão do formato; pré-visualizar registros sem secrets; usar chave idempotente por conta+origem+id e transação; gravar recibo/hash de importação; comparar contagens; preservar original e demos. Falha não pode apagar/reescrever localStorage. Implementação do importador depende de autorização futura.

### Custos e limites

Nenhuma dependência ou serviço adicional contratado; somente banco Cloud existente. Operações Cloud podem consumir créditos além da franquia; a ferramenta de migration não informou custo numérico, saldo ou cobrança. Bucket pendente. Leituras privadas paginadas em lotes de 100; sem polling, monitor, chamadas Gmail ou TinyFish nesta entrega. Verificação pública consulta apenas flags do esquema.
