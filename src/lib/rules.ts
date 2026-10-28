export type CriterionMode = "off" | "blocker" | "preference";
export type Criterion<T> = { mode: CriterionMode; weight: number; value: T };

export type RuleSet = {
  countries: Criterion<string[]>; // "US" | "CA"
  titles: Criterion<string[]>;
  minPayHourlyUsd: Criterion<number>;
  maxExperienceYears: Criterion<number>;
  languages: Criterion<string[]>;
  housing: Criterion<boolean>;
  visaSponsorship: Criterion<boolean>;
  internationalOk: Criterion<boolean>;
  exclusions: Criterion<string[]>;
};

export type Job = {
  id: string;
  demo: boolean;
  url: string;
  employer: string;
  title: string;
  location: string;
  country: "US" | "CA" | string;
  payHourlyUsd?: number | undefined;
  experienceYears?: number | undefined;
  languages?: string[] | undefined;
  housing?: boolean | undefined;
  visaSponsorship?: boolean | undefined;
  internationalOk?: boolean | undefined;
  description?: string | undefined;
  status: "discovered" | "queued" | "attempted" | "confirmed" | "uncertain" | "failed";
  ruleVersionId?: string | undefined;
  eligible?: boolean | undefined;
  score?: number | undefined;
  reasons?: string[] | undefined;
  createdAt: string;
};

export const CRITERIA_LABELS: Record<keyof RuleSet, string> = {
  countries: "País",
  titles: "Categoria / título",
  minPayHourlyUsd: "Remuneração mínima (USD/h)",
  maxExperienceYears: "Experiência máxima exigida (anos)",
  languages: "Idioma",
  housing: "Moradia oferecida",
  visaSponsorship: "Patrocínio de visto",
  internationalOk: "Aceita candidatos internacionais",
  exclusions: "Termos de exclusão",
};

export const defaultRules = (): RuleSet => ({
  countries: { mode: "blocker", weight: 0, value: ["US", "CA"] },
  titles: { mode: "preference", weight: 3, value: [] },
  minPayHourlyUsd: { mode: "off", weight: 2, value: 15 },
  maxExperienceYears: { mode: "off", weight: 1, value: 2 },
  languages: { mode: "off", weight: 1, value: ["inglês"] },
  housing: { mode: "preference", weight: 2, value: true },
  visaSponsorship: { mode: "preference", weight: 3, value: true },
  internationalOk: { mode: "blocker", weight: 0, value: true },
  exclusions: { mode: "blocker", weight: 0, value: [] },
});

const norm = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ").trim();

export type Evaluation = {
  eligible: boolean;
  score: number;
  reasons: string[];
  outcome: "matched" | "mismatch" | "missing_information";
  missingBlockers: (keyof RuleSet)[];
  mismatchedBlockers: (keyof RuleSet)[];
};

export function evaluate(job: Job, r: RuleSet): Evaluation {
  const reasons: string[] = [];
  const missingBlockers: (keyof RuleSet)[] = [];
  const mismatchedBlockers: (keyof RuleSet)[] = [];
  let eligible = true;
  let score = 0;
  let max = 0;
  const check = (key: keyof RuleSet, pass: boolean | undefined, okMsg: string, failMsg: string) => {
    const c = r[key];
    if (c.mode === "off") return;
    if (pass === undefined) {
      reasons.push(`? ${CRITERIA_LABELS[key]}: informação ausente na vaga`);
      if (c.mode === "blocker") { eligible = false; missingBlockers.push(key); }
      if (c.mode === "preference") max += c.weight;
      return;
    }
    if (c.mode === "blocker") {
      if (!pass) { eligible = false; mismatchedBlockers.push(key); reasons.push(`✗ Bloqueio — ${failMsg}`); }
      else reasons.push(`✓ ${okMsg}`);
    } else {
      max += c.weight;
      if (pass) { score += c.weight; reasons.push(`+${c.weight} ${okMsg}`); }
      else reasons.push(`+0 ${failMsg}`);
    }
  };
  check("countries", r.countries.value.length ? r.countries.value.includes(job.country) : true,
    `País ${job.country} permitido`, `País ${job.country} fora da lista`);
  const t = norm(job.title);
  check("titles", r.titles.value.length ? r.titles.value.some((x) => t.includes(norm(x))) : true,
    "Título corresponde à categoria", "Título não corresponde às categorias");
  check("minPayHourlyUsd", job.payHourlyUsd === undefined ? undefined : job.payHourlyUsd >= r.minPayHourlyUsd.value,
    `Paga ≥ US$${r.minPayHourlyUsd.value}/h`, `Paga abaixo de US$${r.minPayHourlyUsd.value}/h`);
  check("maxExperienceYears", job.experienceYears === undefined ? undefined : job.experienceYears <= r.maxExperienceYears.value,
    "Experiência exigida compatível", `Exige mais de ${r.maxExperienceYears.value} ano(s)`);
  check("languages", job.languages ? job.languages.some((l) => r.languages.value.map(norm).includes(norm(l))) : undefined,
    "Idioma compatível", "Idioma incompatível");
  check("housing", job.housing === undefined ? undefined : job.housing === r.housing.value,
    "Moradia conforme preferência", "Moradia não conforme");
  check("visaSponsorship", job.visaSponsorship === undefined ? undefined : job.visaSponsorship === r.visaSponsorship.value,
    "Patrocínio de visto conforme", "Sem patrocínio de visto");
  check("internationalOk", job.internationalOk === undefined ? undefined : job.internationalOk === r.internationalOk.value,
    "Aceita candidatos internacionais", "Não aceita candidatos internacionais");
  const text = norm(`${job.title} ${job.description ?? ""} ${job.employer}`);
  const hit = r.exclusions.value.find((x) => x.trim() && text.includes(norm(x)));
  check("exclusions", !hit, "Nenhum termo de exclusão", `Contém termo excluído "${hit}"`);
  return {
    eligible, score: max ? Math.round((score / max) * 100) : 100, reasons,
    outcome: mismatchedBlockers.length ? "mismatch" : missingBlockers.length ? "missing_information" : "matched",
    missingBlockers, mismatchedBlockers,
  };
}

export function normalizeUrl(raw: string): string {
  try {
    const u = new URL(raw.trim());
    const host = u.hostname.toLowerCase().replace(/^www\./, "");
    const params = [...u.searchParams.entries()]
      .filter(([k]) => !/^(utm_|ref$|source$|fbclid|gclid)/i.test(k))
      .sort(([a], [b]) => a.localeCompare(b));
    const qs = params.length ? "?" + new URLSearchParams(params).toString() : "";
    const path = u.pathname.replace(/\/+$/, "") || "";
    return `${host}${path}${qs}`;
  } catch {
    return norm(raw);
  }
}

export const fingerprint = (j: Pick<Job, "employer" | "title" | "location">) =>
  [j.employer, j.title, j.location].map((s) => norm(s).replace(/[^a-z0-9 ]/g, "")).join("|");

export function isDuplicate(candidate: Job, existing: Job[]): Job | undefined {
  const u = normalizeUrl(candidate.url);
  const f = fingerprint(candidate);
  return existing.find((e) => normalizeUrl(e.url) === u || fingerprint(e) === f);
}
