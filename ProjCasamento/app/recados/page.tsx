import Link from "next/link";
import { validateGuestToken } from "@/lib/auth";
import { getConvidadoByToken } from "@/lib/google";
import { EVENTO } from "@/lib/evento";
import { InvitePageShell } from "@/components/invite/InvitePageShell";
import RecadosClient from "./RecadosClient";
import {
  presentesCard,
  presentesLayoutLoja,
  presentesLinkVoltar,
} from "../presentes/presentesTheme";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ token?: string | string[] }> | { token?: string | string[] };
};

function pickParam(v: string | string[] | undefined): string {
  if (v === undefined) return "";
  return (Array.isArray(v) ? v[0] : v)?.toString().trim() ?? "";
}

function ErroRecados({ mensagem, detalhe }: { mensagem: string; detalhe?: string }) {
  return (
    <InvitePageShell className="flex min-h-screen flex-col items-center justify-center py-16">
      <div className={presentesLayoutLoja}>
        <div className={`${presentesCard} px-8 py-12 text-center`}>
          <p className="font-invite-caps text-lg font-medium tracking-wide text-invite-olive">{mensagem}</p>
          {detalhe && <p className="mt-4 font-sans text-sm text-invite-olive/80">{detalhe}</p>}
        </div>
      </div>
    </InvitePageShell>
  );
}

export default async function RecadosPage({ searchParams }: Props) {
  const params = await searchParams;
  const token = pickParam(params?.token);

  if (!token) {
    return <ErroRecados mensagem="Link inválido." detalhe="Acesse através do link do seu convite." />;
  }

  const isValid = await validateGuestToken(token);
  if (!isValid) {
    return (
      <ErroRecados
        mensagem="Link inválido ou expirado."
        detalhe="Entre em contato com os noivos se acredita que isso é um erro."
      />
    );
  }

  const convidado = await getConvidadoByToken(token);
  const nome = convidado?.[1] || "Convidado";
  const { primeiro, segundo } = EVENTO.noivos;

  return (
    <InvitePageShell className="py-8 sm:py-10 md:py-12 lg:py-16">
      <div className={`${presentesLayoutLoja} w-full`}>
        <Link href={`/convite?token=${encodeURIComponent(token)}`} className={presentesLinkVoltar}>
          ← Voltar ao convite
        </Link>

        <div className={`${presentesCard} px-4 py-8 sm:px-8 sm:py-10 md:px-10 md:py-12`}>
          <header className="mb-8 border-b border-invite-olive/15 pb-7 text-center md:mb-10 md:pb-8">
            <p className="font-invite-caps text-[0.68rem] font-medium uppercase tracking-[0.24em] text-invite-olive/80 sm:text-xs">
              Mural de recados
            </p>
            <h1 className="font-heading mt-3 text-[1.5rem] italic leading-snug text-invite-olive sm:text-[1.75rem] md:text-[2rem]">
              Olá, {nome}
            </h1>
            <p className="font-invite-caps mt-2 text-[0.65rem] font-medium uppercase tracking-[0.18em] text-invite-olive sm:text-xs">
              {primeiro} & {segundo}
            </p>
            <p className="font-sans mx-auto mt-4 max-w-md text-sm leading-relaxed text-invite-olive/80">
              Deixe uma mensagem carinhosa para os noivos. Ela aparece no mural abaixo para todos os
              convidados.
            </p>
          </header>

          <RecadosClient token={token} />
        </div>
      </div>
    </InvitePageShell>
  );
}
