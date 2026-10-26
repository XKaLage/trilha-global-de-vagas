import { useSyncExternalStore } from "react";
import { defaultRules, evaluate, isDuplicate, type Job, type RuleSet } from "./rules";

// Local prototype store. Holds NON-SECRET app data only. Never put tokens/keys here.
export type RuleVersion = {
  id: string; version: number; status: "draft" | "testing" | "active" | "archived";
  note: string; createdAt: string; rules: RuleSet;
};
export type AuditEntry = { id: string; at: string; action: string; detail: string };
export type Response = {
  id: string; demo: boolean; jobId?: string; employer: string;
  kind: "interview" | "rejection" | "info" | "other"; summary: string; receivedAt: string;
};
export type ProfileFact = { id: string; label: string; value: string; verified: boolean; addedAt: string };
export type AppState = {
  session: { status: "idle" | "running" | "paused"; cap: number; startedAt?: string; submitted: number };
  jobs: Job[];
  responses: Response[];
  versions: RuleVersion[];
  audit: AuditEntry[];
  profile: ProfileFact[];
  settings: { requireManualReview: boolean };
};

const KEY = "rci-state-v1";
const uid = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();

const initial = (): AppState => ({
  session: { status: "idle", cap: 20, submitted: 0 },
  jobs: [], responses: [], audit: [], profile: [],
  versions: [{ id: "v1", version: 1, status: "draft", note: "Regras iniciais", createdAt: now(), rules: defaultRules() }],
  settings: { requireManualReview: true },
});

const SERVER = initial();
let state: AppState = SERVER;
let loaded = false;
const listeners = new Set<() => void>();

function ensureLoaded() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) state = { ...initial(), ...JSON.parse(raw) };
  } catch { /* ignore corrupted state */ }
}

function set(fn: (s: AppState) => AppState, audit?: [string, string]) {
  ensureLoaded();
  let next = fn(state);
  if (audit) next = { ...next, audit: [{ id: uid(), at: now(), action: audit[0], detail: audit[1] }, ...next.audit].slice(0, 500) };
  state = next;
  localStorage.setItem(KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
}

export function useApp(): AppState {
  return useSyncExternalStore(
    (l) => { ensureLoaded(); listeners.add(l); l(); return () => listeners.delete(l); },
    () => { ensureLoaded(); return state; },
    () => SERVER,
  );
}

export const activeVersion = (s: AppState) => s.versions.find((v) => v.status === "active");

export function counters(s: AppState) {
  const c = (st: Job["status"]) => s.jobs.filter((j) => j.status === st).length;
  return {
    discovered: s.jobs.length,
    eligible: s.jobs.filter((j) => j.eligible).length,
    queued: c("queued"),
    attempted: c("attempted") + c("confirmed") + c("uncertain") + c("failed"),
    confirmed: c("confirmed"),
    uncertain: c("uncertain"),
    failed: c("failed"),
    responses: s.responses.length,
  };
}

export const actions = {
  start: () => set((s) => ({ ...s, session: { ...s.session, status: "running", startedAt: now(), submitted: 0 } }),
    ["sessão.iniciar", "Sessão iniciada (protótipo: nenhuma candidatura real é enviada)"]),
  pause: () => set((s) => ({ ...s, session: { ...s.session, status: "paused" } }), ["sessão.pausar", "Sessão pausada"]),
  resume: () => set((s) => ({ ...s, session: { ...s.session, status: "running" } }), ["sessão.retomar", "Sessão retomada"]),
  stop: () => set((s) => ({ ...s, session: { ...s.session, status: "idle" } }), ["sessão.encerrar", "Sessão encerrada"]),
  setCap: (cap: number) => set((s) => ({ ...s, session: { ...s.session, cap } }), ["config.limite", `Limite por sessão = ${cap}`]),
  setSettings: (p: Partial<AppState["settings"]>) => set((s) => ({ ...s, settings: { ...s.settings, ...p } }), ["config.alterar", JSON.stringify(p)]),

  addJob: (j: Omit<Job, "id" | "status" | "createdAt">): { ok: boolean; reason?: string } => {
    const full: Job = { ...j, id: uid(), status: "discovered", createdAt: now() };
    const dup = isDuplicate(full, state.jobs);
    if (dup) {
      set((s) => s, ["vaga.duplicada", `${j.title} @ ${j.employer} ignorada (duplicata de ${dup.id})`]);
      return { ok: false, reason: `Duplicata de "${dup.title} — ${dup.employer}"` };
    }
    const v = activeVersion(state);
    if (v) Object.assign(full, evaluate(full, v.rules), { ruleVersionId: v.id });
    set((s) => ({ ...s, jobs: [full, ...s.jobs] }), ["vaga.adicionar", `${j.demo ? "[EXEMPLO] " : ""}${j.title} @ ${j.employer}`]);
    return { ok: true };
  },
  queueJob: (id: string) => set((s) => ({ ...s, jobs: s.jobs.map((j) => (j.id === id ? { ...j, status: "queued" } : j)) }),
    ["vaga.fila", `Vaga ${id} adicionada à fila (envio real desativado)`]),
  removeJob: (id: string) => set((s) => ({ ...s, jobs: s.jobs.filter((j) => j.id !== id) }), ["vaga.remover", id]),
  reevaluate: () => set((s) => {
    const v = activeVersion(s);
    if (!v) return s;
    return { ...s, jobs: s.jobs.map((j) => ({ ...j, ...evaluate(j, v.rules), ruleVersionId: v.id })) };
  }, ["regras.reavaliar", "Vagas reavaliadas com a versão ativa"]),

  saveDraft: (rules: RuleSet, note: string) => set((s) => {
    const n = Math.max(...s.versions.map((v) => v.version)) + 1;
    return { ...s, versions: [{ id: `v${n}`, version: n, status: "draft", note, createdAt: now(), rules }, ...s.versions] };
  }, ["regras.rascunho", note || "Novo rascunho"]),
  setVersionStatus: (id: string, status: "testing" | "active") => set((s) => ({
    ...s,
    versions: s.versions.map((v) =>
      v.id === id ? { ...v, status } : status === "active" && v.status === "active" ? { ...v, status: "archived" } : v),
  }), [status === "active" ? "regras.ativar" : "regras.testar", `Versão ${id}`]),
  rollback: (id: string) => set((s) => ({
    ...s,
    versions: s.versions.map((v) => (v.id === id ? { ...v, status: "active" } : v.status === "active" ? { ...v, status: "archived" } : v)),
  }), ["regras.rollback", `Rollback para ${id}`]),

  addFact: (label: string, value: string) => set((s) => ({ ...s, profile: [...s.profile, { id: uid(), label, value, verified: false, addedAt: now() }] }),
    ["perfil.adicionar", label]),
  verifyFact: (id: string) => set((s) => ({ ...s, profile: s.profile.map((f) => (f.id === id ? { ...f, verified: true } : f)) }), ["perfil.verificar", id]),
  removeFact: (id: string) => set((s) => ({ ...s, profile: s.profile.filter((f) => f.id !== id) }), ["perfil.remover", id]),

  loadDemo: () => {
    const demo: Omit<Job, "id" | "status" | "createdAt">[] = [
      { demo: true, url: "https://example.com/demo/1", employer: "Exemplo Resort", title: "Line Cook (EXEMPLO)", location: "Banff, AB", country: "CA", payHourlyUsd: 14, housing: true, visaSponsorship: true, internationalOk: true, languages: ["inglês"] },
      { demo: true, url: "https://example.com/demo/2", employer: "Exemplo Farms", title: "Farm Worker (EXEMPLO)", location: "Fresno, CA", country: "US", payHourlyUsd: 18, housing: false, visaSponsorship: true, internationalOk: true },
      { demo: true, url: "https://example.com/demo/3", employer: "Exemplo Corp", title: "Unpaid Intern (EXEMPLO)", location: "Austin, TX", country: "US", internationalOk: false, description: "unpaid" },
    ];
    demo.forEach((d) => actions.addJob(d));
    set((s) => ({
      ...s,
      responses: [
        { id: uid(), demo: true, employer: "Exemplo Resort", kind: "interview", summary: "EXEMPLO: convite fictício para entrevista", receivedAt: now() },
        { id: uid(), demo: true, employer: "Exemplo Farms", kind: "rejection", summary: "EXEMPLO: resposta fictícia de rejeição", receivedAt: now() },
        { id: uid(), demo: true, employer: "Exemplo Corp", kind: "info", summary: "EXEMPLO: pedido fictício de informações adicionais", receivedAt: now() },
        ...s.responses],
    }), ["demo.carregar", "Dados de exemplo carregados"]);
  },
  clearDemo: () => set((s) => ({ ...s, jobs: s.jobs.filter((j) => !j.demo), responses: s.responses.filter((r) => !r.demo) }), ["demo.limpar", "Dados de exemplo removidos"]),
  resetAll: () => set(() => initial(), ["sistema.reset", "Todos os dados locais apagados"]),
};
