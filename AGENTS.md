<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- App state lives in `src/lib/store.ts` (localStorage, non-secret only) until Lovable Cloud is enabled; why: prototype without backend.
- Integration adapters/status are declared in `src/lib/integrations.ts`; statuses change only after server-side verification; why: never fake connections.
- Gmail stays setup-needed without a linked readonly-only connection and server-side caller authorization; never add a public inbox endpoint or treat CSRF as authentication, because workspace credentials expose a private shared mailbox.
- Rule evaluation and dedup live in `src/lib/rules.ts` with tests; why: core business logic stays pure and testable.
- Job cards and rule previews use `JobEvaluation` with the applicable rule version and explicit mismatch/missing-data outcomes; why: absent evaluation must never look like a rejection and missing blockers must still prevent eligibility.
