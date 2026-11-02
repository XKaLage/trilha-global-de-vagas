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

- Existing screens keep `src/lib/store.ts` unchanged; persistence is an opt-in parallel foundation, because local prototype data must never be automatically migrated or overwritten.
- Integration adapters/status are declared in `src/lib/integrations.ts`; statuses change only after server-side verification; why: never fake connections.
- Gmail stays setup-needed without a linked readonly-only connection and server-side caller authorization; never add a public inbox endpoint or treat CSRF as authentication, because workspace credentials expose a private shared mailbox.
- Rule evaluation and dedup live in `src/lib/rules.ts` with tests; why: core business logic stays pure and testable.
- Job cards and rule previews use `JobEvaluation` with the applicable rule version and explicit mismatch/missing-data outcomes; why: absent evaluation must never look like a rejection and missing blockers must still prevent eligibility.
- Persistent access lives in persistence.functions.ts/persistence.server.ts with authenticated RLS clients and database commands deriving auth.uid(); never use admin clients for ordinary access, because client-supplied ownership is untrusted.
- Candidate identities reference public.profiles; only profiles and user_roles reference auth.users, because managed schema ownership must remain narrow.
- Admin access requires both a protected user_roles row and server-controlled app_metadata.role; never auto-promote accounts, because writable metadata must not grant privileges.
- Public registration is rejected by a provisioning trigger requiring trusted app_metadata.foundation_provisioned; login providers remain unchanged, because this delivery prepares private access without creating accounts.
- External application statuses and document uploads remain database-blocked/unimplemented; private-message sync has no entry point, because schema availability is not action authorization.
- MCP exposes only bounded caller-owned job and rule-version reads through OAuth with client_id and RLS; WebMCP remains page-local read-only, because agent access must not bypass provisioning, local-data boundaries or external-action restrictions.
