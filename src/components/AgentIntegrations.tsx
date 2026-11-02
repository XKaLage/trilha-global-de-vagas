import { Link } from "@tanstack/react-router";
import { useWebMCP } from "use-webmcp-tool";
import { Button } from "@/components/ui/button";
import { runWebMCPTool } from "@/lib/webmcp-telemetry";

const SUMMARY = "MCP preparado para consultas de vagas persistentes e versões de regras via OAuth. Conexão pendente de conta provisionada, método de entrada e republicação. Gmail, documentos, candidaturas e dados locais não são expostos.";
export function AgentIntegrations() {
  useWebMCP({
    name: "read_agent_integration_status",
    description: "Consulta o estado e os bloqueios da integração de agentes exibidos nesta página, sem chamar serviços externos.",
    annotations: { readOnlyHint: true },
    execute: () => runWebMCPTool("read_agent_integration_status", () => SUMMARY),
  });
  return <section className="space-y-3 border-b pb-4">
    <h2 className="font-semibold">Integrações de agentes · MCP</h2>
    <p className="text-sm">{SUMMARY}</p>
    <Button asChild variant="outline"><Link to="/auth" search={{ next: "/" }}>Acesso privado</Link></Button>
  </section>;
}