import { Mail, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export const GMAIL_SETTINGS_URL = "https://lovable.dev/dashboard?connectors=&connector=google_mail&workspace=f6cc2e2e202cd66558b3";

export function GmailPendingNotice() {
  return (
    <section aria-label="Situação do Gmail" className="tint-warning rounded-md p-4">
      <div className="flex items-center gap-2 font-semibold text-tint-warning">
        <Mail className="size-5 shrink-0" aria-hidden="true" />
        <h2>Gmail pendente no app</h2>
      </div>
      <p className="mt-2 text-sm">Na verificação de 28/10/2026, as duas conexões Gmail do Lovable não estavam vinculadas a este projeto. O acesso durante a conversa não conecta o app.</p>
      <p className="mt-2 text-sm">As permissões concedidas também incluem envio, rascunhos e modificação. Esta versão não lê mensagens e mantém todas essas ações bloqueadas.</p>
      <p className="mt-2 text-sm">Para liberar a leitura: ajuste uma conexão para somente <code>gmail.readonly</code> nas configurações abaixo. Antes de vinculá-la, será necessário proteger o acesso às mensagens com identificação segura de quem usa o app; o app atual não tem login. Sem isso, seus e-mails poderiam ficar expostos.</p>
      <Button asChild variant="outline" className="mt-3 min-h-11 h-auto w-full whitespace-normal text-center sm:w-auto">
        <a href={GMAIL_SETTINGS_URL} target="_blank" rel="noopener noreferrer">
          <Settings aria-hidden="true" />Configurações do Gmail no Lovable
        </a>
      </Button>
      <p className="mt-2 text-xs text-muted-foreground">Nenhum banco, Cloud ou serviço pago foi ativado. A leitura continua pendente; os dados deste navegador foram preservados.</p>
    </section>
  );
}