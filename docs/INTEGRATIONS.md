# Integrações — guia de configuração segura

Nada está conectado nesta versão. Segredos vão somente em variáveis de ambiente do servidor (Segredos do projeto), nunca no navegador/localStorage.

| Integração | Variáveis | Escopo |
|---|---|---|
| TinyFish (busca/fetch/navegador) | `TINYFISH_API_KEY` | Busca/fetch primeiro; navegador exige nova autorização |
| Banco persistente (Lovable Cloud) | `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` | Tabelas com RLS |
| Gmail | `GOOGLE_MAIL_API_KEY`, `LOVABLE_API_KEY` | Apenas `gmail.readonly`. Enviar, rascunhar, encaminhar, excluir e modificar ficam bloqueados até autorização separada |
| Notificações | `NOTIFY_WEBHOOK_URL` | Desativado por política |

Regras: nunca pedir senhas ou códigos de verificação; sem candidaturas reais, criação de contas, e-mails de saída, monitoramento pago ou automação de navegador nesta versão.
