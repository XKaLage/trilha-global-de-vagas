# Trilha Global De Vagas

Create a mobile-first Portuguese-language web app called Robô de Candidaturas Internacionais. This is a prototype/scaffold for managing job search and application workflows for the United States and Canada. Build a polished dashboard with navigation for Visão Geral, Vagas, Histórico, Respostas, Regras, Perfil/CV, Integrações, Auditoria and Configurações. Include session controls Iniciar/Pausar/Retomar, a configurable cap initially set to 20 submissions per session, counters that clearly distinguish discovered jobs, eligible jobs, queued, attempted, confirmed submissions, uncertain outcomes, failures, and employer responses. No fake real activity; mark all example/demo data clearly. Include flexible rule editor: country, job category/title, minimum pay, experience, language, housing, visa sponsorship, international-candidate acceptance, exclusion terms; separate hard blockers from weighted preferences; human-readable match/rejection reasons; draft/test/activate modes; version history and rollback. Include deduplication by normalized URL and fallback employer/title/location fingerprint. Include audit log and a performance view by rule version. Profile/CV starts empty and must only contain facts later supplied and verified by the user. Integrations page should show TinyFish search/fetch/browser, persistent database, Gmail, job sources and optional notifications, with truthful statuses and secure setup steps. Gmail should be planned as least-privilege OAuth with read-only mail access first, only for detecting employer replies/interviews/rejections; sending, drafting, forwarding, deleting and modifying emails must remain disabled until separate explicit authorization. Never ask for passwords or verification codes. No real job applications, no account creation on third-party sites, no outbound emails, no paid monitoring, and no external browser automation in this initial build. External action buttons should be disabled and explain why. Use persistent database if available for app data, but do not store secrets in client/local storage. Keep integration adapters modular, with environment-variable placeholders and setup docs; never pretend integrations are connected unless verified. Make the app usable on iPhone Safari, with clean responsive cards, accessible controls, empty/loading/error states, cost transparency and clear distinctions between prototype and production. Build the initial usable scaffold now; do not publish it automatically.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://trilha-global-de-vagas.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/5ace2722-ff26-4664-a350-56a49388ea3c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
