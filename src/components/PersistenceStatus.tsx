import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { getPersistenceStatus } from "@/lib/persistence.functions";

export function PersistenceStatus() {
  const check = useServerFn(getPersistenceStatus);
  const [result, setResult] = useState<Awaited<ReturnType<typeof getPersistenceStatus>> | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  async function verify() { setPending(true); setError(false); try { setResult(await check()); } catch { setError(true); } finally { setPending(false); } }
  return <div className="mt-3 space-y-2">
    <Button variant="outline" disabled={pending} onClick={verify}>{pending ? "Verificando…" : "Verificar banco e esquema"}</Button>
    <p role="status" className="text-sm">{error ? "Verificação indisponível; tente novamente." : result ? `Infraestrutura ${result.infrastructure ? "verificada" : "indisponível"} · Esquema ${result.schema ? `implantado (v${result.version})` : "não verificado"}` : "Infraestrutura habilitada; verificação do esquema disponível."}</p>
    <p className="text-xs text-muted-foreground">Dados locais preservados. Migração, documentos e Gmail permanecem bloqueados.</p>
    <Button asChild variant="link"><Link to="/auth">Acesso privado</Link></Button>
  </div>;
}