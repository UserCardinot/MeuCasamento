import { InvitePageShell } from "@/components/invite/InvitePageShell";
import { validateEventToken } from "@/lib/auth";
import { presentesCard, presentesColuna } from "@/app/presentes/presentesTheme";
import MidiaClient from "./MidiaClient";

type Props = {
  searchParams: Promise<{ eventToken?: string | string[] }> | { eventToken?: string | string[] };
};

function ErroMidia({ mensagem, detalhe }: { mensagem: string; detalhe?: string }) {
  return (
    <InvitePageShell className="flex min-h-screen flex-col items-center justify-center py-16">
      <div className={presentesColuna}>
        <div className={`${presentesCard} px-8 py-12 text-center`}>
          <p className="font-invite-caps text-lg font-medium tracking-wide text-invite-olive">{mensagem}</p>
          {detalhe && <p className="mt-4 font-sans text-sm text-invite-olive/80">{detalhe}</p>}
        </div>
      </div>
    </InvitePageShell>
  );
}

export default async function MidiaPage({ searchParams }: Props) {
  const params = await searchParams;
  const raw = params?.eventToken;
  const eventToken = (typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : undefined)
    ?.toString()
    .trim();

  if (!eventToken) {
    return (
      <ErroMidia mensagem="Link inválido." detalhe="Escaneie o QR Code na mesa para acessar." />
    );
  }

  if (!validateEventToken(eventToken)) {
    return <ErroMidia mensagem="Link inválido ou expirado." />;
  }

  return (
    <InvitePageShell className="flex min-h-screen flex-col items-center py-10 sm:py-14 md:py-16 lg:py-20">
      <MidiaClient eventToken={eventToken} />
    </InvitePageShell>
  );
}
