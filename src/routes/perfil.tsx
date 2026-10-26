import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, Empty, meta } from "@/components/AppShell";
import { actions, useApp } from "@/lib/store";

export const Route = createFileRoute("/perfil")({
  head: () => meta("Perfil/CV", "Fatos do perfil fornecidos e verificados pelo usuário."),
  component: Perfil,
});

function Perfil() {
  const s = useApp();
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");
  return (
    <AppShell title="Perfil/CV" subtitle="Contém apenas fatos que você informar e verificar. Nada é inventado.">
      <form className="surface p-4 grid gap-3" onSubmit={(e) => { e.preventDefault(); if (label && value) { actions.addFact(label, value); setLabel(""); setValue(""); } }}>
        <label className="text-sm">Campo (ex.: Idiomas, Experiência)<input className="field mt-1" value={label} onChange={(e) => setLabel(e.target.value)} /></label>
        <label className="text-sm">Valor<textarea className="field mt-1" rows={2} value={value} onChange={(e) => setValue(e.target.value)} /></label>
        <button className="btn btn-primary">Adicionar fato (não verificado)</button>
        <p className="text-xs text-muted-foreground">Não informe senhas, códigos de verificação ou documentos sensíveis.</p>
      </form>
      {s.profile.length === 0 ? <Empty title="Perfil vazio" hint="Adicione fatos sobre você e marque-os como verificados." /> :
        s.profile.map((f) => (
          <div key={f.id} className="surface p-4">
            <div className="flex justify-between gap-2"><b>{f.label}</b><span className={`text-xs font-semibold ${f.verified ? "text-success" : "text-warning"}`}>{f.verified ? "Verificado" : "Não verificado"}</span></div>
            <p className="text-sm whitespace-pre-wrap">{f.value}</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button className="btn btn-ghost" disabled={f.verified} onClick={() => actions.verifyFact(f.id)}>Confirmo que é verdadeiro</button>
              <button className="btn btn-ghost" onClick={() => actions.removeFact(f.id)}>Remover</button>
            </div>
          </div>
        ))}
    </AppShell>
  );
}
