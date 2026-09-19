import { InvitePageShell } from "@/components/invite/InvitePageShell";
import { presentesCard, presentesColuna } from "@/app/presentes/presentesTheme";
import { pickEventTokenParam, validateEventToken } from "@/lib/auth";
import GaleriaPageClient from "./GaleriaPageClient";

type Props = {
  searchParams:
    | Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>;
};

function ErroGaleria({ mensagem, detalhe }: { mensagem: string; detalhe?: string }) {
  return (
    <InvitePageShell className="midia-atmosphere flex min-h-screen flex-col items-center justify-center py-16">
      <div className={presentesColuna}>
        <div className={`${presentesCard} px-8 py-12 text-center`}>
          <p className="font-sans text-lg font-medium text-invite-olive">{mensagem}</p>
          {detalhe && <p className="mt-4 font-sans text-base text-invite-olive/80">{detalhe}</p>}
        </div>
      </div>
    </InvitePageShell>
  );
}

export default async function GaleriaPage({ searchParams }: Props) {
  const params = await searchParams;
  const eventToken = pickEventTokenParam(params);

  if (!eventToken) {
    return (
      <ErroGaleria
        mensagem="Link inválido."
        detalhe="Escaneie o QR Code na mesa para acessar o álbum."
      />
    );
  }

  if (!validateEventToken(eventToken)) {
    return <ErroGaleria mensagem="Link inválido ou expirado." />;
  }

  return (
    <InvitePageShell className="midia-atmosphere flex min-h-screen flex-col items-center py-10 sm:py-14 md:py-16 lg:py-20">
      <GaleriaPageClient eventToken={eventToken} />
    </InvitePageShell>
  );
}
