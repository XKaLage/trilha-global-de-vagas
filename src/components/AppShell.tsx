import { Link, useLocation } from "@tanstack/react-router";
import type { ReactNode } from "react";

const NAV = [
  { to: "/", label: "Visão Geral" },
  { to: "/vagas", label: "Vagas" },
  { to: "/historico", label: "Histórico" },
  { to: "/respostas", label: "Respostas" },
  { to: "/regras", label: "Regras" },
  { to: "/perfil", label: "Perfil/CV" },
  { to: "/integracoes", label: "Integrações" },
  { to: "/auditoria", label: "Auditoria" },
  { to: "/configuracoes", label: "Configurações" },
] as const;

export function AppShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen md:flex">
      <aside className="md:w-60 md:min-h-screen md:border-r bg-card md:sticky md:top-0">
        <div className="px-4 pt-[max(env(safe-area-inset-top),1rem)] pb-3">
          <div className="font-display text-lg font-bold leading-tight">Robô de Candidaturas<br /><span className="text-primary">Internacionais</span></div>
          <div className="mt-1 inline-block rounded-full bg-demo px-2 py-0.5 text-xs font-semibold text-demo-foreground">PROTÓTIPO · sem ações reais</div>
        </div>
        <nav aria-label="Navegação principal" className="flex gap-2 overflow-x-auto px-4 pb-3 md:flex-col md:gap-1 md:overflow-visible">
          {NAV.map((n) => {
            const active = pathname === n.to;
            return (
              <Link key={n.to} to={n.to} aria-current={active ? "page" : undefined}
                className={`whitespace-nowrap rounded-full md:rounded-md px-3 py-2 text-sm font-medium min-h-[40px] flex items-center ${active ? "bg-primary text-primary-foreground" : "bg-secondary md:bg-transparent text-secondary-foreground hover:bg-muted"}`}>
                {n.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 px-4 py-5 md:px-8 pb-[max(env(safe-area-inset-bottom),2rem)] max-w-5xl">
        <h1 className="text-2xl font-bold md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        <div className="mt-5 space-y-4">{children}</div>
      </main>
    </div>
  );
}

export function Empty({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="surface p-6 text-center">
      <p className="font-semibold">{title}</p>
      {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function DemoBadge() {
  return <span className="rounded bg-demo px-1.5 py-0.5 text-[10px] font-bold text-demo-foreground">EXEMPLO</span>;
}

export function DisabledAction({ label, why }: { label: string; why: string }) {
  return (
    <div>
      <button className="btn btn-ghost w-full" disabled aria-describedby={`why-${label}`}>{label}</button>
      <p id={`why-${label}`} className="mt-1 text-xs text-muted-foreground">{why}</p>
    </div>
  );
}

export const meta = (title: string, description: string) => ({
  meta: [
    { title: `${title} · Robô de Candidaturas Internacionais` },
    { name: "description", content: description },
    { property: "og:title", content: `${title} · Robô de Candidaturas Internacionais` },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ],
});
