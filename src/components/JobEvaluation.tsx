import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { evaluate, type Job } from "@/lib/rules";
import type { RuleVersion } from "@/lib/store";

export function JobEvaluation({ job, version }: { job: Job; version: RuleVersion | undefined }) {
  const result = version ? evaluate(job, version.rules) : undefined;
  const label = !result ? "Não avaliada" : result.outcome === "mismatch" ? "Rejeitada · incompatibilidade" : result.outcome === "missing_information" ? "Informação insuficiente" : `Elegível · ${result.score}%`;
  const tint = !result || result.outcome === "missing_information" ? "text-tint-warning" : result.eligible ? "text-tint-success" : "text-tint-danger";
  return (
    <div className="mt-3 space-y-2 text-sm">
      <p className={`font-semibold ${tint}`}>{label}</p>
      {!result ? <>
        <p>{job.ruleVersionId ? "A versão usada nesta vaga não está disponível; não é possível reconstruir a avaliação." : "Nenhuma regra ativa foi aplicada a esta vaga. Ela não foi rejeitada."}</p>
        <Button asChild variant="secondary" className="min-h-11"><Link to="/regras">Revisar e ativar regras</Link></Button>
      </> : <>
        {result.outcome === "missing_information" && <p>Faltam dados exigidos por bloqueios. A vaga não pode entrar na fila até serem informados.</p>}
        {result.outcome === "mismatch" && <p>Os dados informados não atendem a pelo menos um bloqueio.</p>}
        <ul className="space-y-1 break-words" aria-label="Motivos da avaliação">{result.reasons.map((reason, index) => <li key={index}>{reason}</li>)}</ul>
      </>}
      <p className="text-xs text-muted-foreground">Dados informados: visto {job.visaSponsorship === undefined ? "não informado" : job.visaSponsorship ? "sim" : "não"} · aceita internacionais {job.internationalOk === undefined ? "não informado" : job.internationalOk ? "sim" : "não"}</p>
    </div>
  );
}