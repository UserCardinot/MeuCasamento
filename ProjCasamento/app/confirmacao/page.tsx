import Link from "next/link";
import { validateGuestToken } from "@/lib/auth";
import { getConvidadoByToken, getPresencaStatus } from "@/lib/google";
import { EVENTO } from "@/lib/evento";
import { parseAcompanhantesLista } from "@/lib/acompanhantes";
import { InvitePageShell } from "@/components/invite/InvitePageShell";
import FormConfirmacao from "./FormConfirmacao";

const inviteColuna =
  "mx-auto w-full max-w-[36rem] px-5 sm:px-8 md:max-w-[48rem] lg:max-w-[56rem] xl:max-w-[64rem]";

type Props = {
  searchParams: Promise<{ token?: string | string[] }> | { token?: string | string[] };
};

function ErroConfirmacao({ mensagem, detalhe }: { mensagem: string; detalhe?: string }) {
  return (
    <InvitePageShell className="flex min-h-screen flex-col items-center justify-center py-16">
      <div className={inviteColuna}>
        <div className="border border-invite-olive/50 bg-invite-cream/70 px-8 py-12 text-center">
          <p className="font-invite-caps text-lg font-medium tracking-wide text-invite-olive">{mensagem}</p>
          {detalhe && <p className="mt-4 font-sans text-sm text-invite-olive/80">{detalhe}</p>}
        </div>
      </div>
    </InvitePageShell>
  );
}

export default async function ConfirmacaoPage({ searchParams }: Props) {
  const params = await searchParams;
  const raw = params?.token;
  const token = (typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : undefined)
    ?.toString()
    .trim();

  if (!token) {
    return <ErroConfirmacao mensagem="Link inválido." detalhe="Acesse através do link do seu convite." />;
  }

  const isValid = await validateGuestToken(token);
  if (!isValid) {
    return (
      <ErroConfirmacao
        mensagem="Link inválido ou expirado."
        detalhe="Entre em contato com os noivos se acredita que isso é um erro."
      />
    );
  }

  const [convidado, presenca] = await Promise.all([
    getConvidadoByToken(token),
    getPresencaStatus(token),
  ]);
  const nome = convidado?.[1] || "Convidado";
  const { primeiro, segundo } = EVENTO.noivos;
  const confirmadoInicial = presenca === null ? undefined : presenca.confirmado ? "sim" : "nao";
  const mensagemInicial = presenca?.mensagem?.trim() || undefined;
  const acompanhantesConvite = parseAcompanhantesLista(convidado?.[2] ?? "");
  const acompanhantesSalvos = presenca?.nomesAcompanhantes?.trim()
    ? parseAcompanhantesLista(presenca.nomesAcompanhantes)
    : [];
  const acompanhantesSelecionadosInicial =
    acompanhantesSalvos.length > 0 ? acompanhantesSalvos : [...acompanhantesConvite];

  return (
    <InvitePageShell className="flex min-h-screen flex-col items-center justify-center py-12 sm:py-16 md:py-20 lg:py-24">
      <div className={`${inviteColuna} w-full`}>
        <Link
          href={`/convite?token=${encodeURIComponent(token)}`}
          className="font-invite-caps mb-8 inline-block text-[0.68rem] font-medium uppercase tracking-[0.2em] text-invite-olive/75 transition-colors hover:text-invite-olive sm:mb-10 sm:text-xs md:text-sm"
        >
          ← Voltar ao convite
        </Link>

        <div className="border border-invite-olive/40 bg-invite-cream/75 px-6 py-10 shadow-sm sm:px-10 sm:py-12 md:px-12 md:py-14 lg:px-16 lg:py-16">
          <header className="mb-10 text-center md:mb-12">
            <p className="font-invite-caps text-[0.72rem] font-medium uppercase tracking-[0.28em] text-invite-olive/80 sm:text-xs md:text-sm md:tracking-[0.32em]">
              Confirmação de presença
            </p>
            <h1 className="font-heading mt-4 text-[1.65rem] italic leading-snug text-invite-olive sm:text-[1.85rem] md:mt-5 md:text-[2.35rem] lg:text-[2.6rem]">
              Olá, {nome}
            </h1>
            <p className="font-invite-caps mt-3 text-[0.68rem] font-medium uppercase tracking-[0.2em] text-invite-olive sm:text-[0.72rem] md:mt-4 md:text-sm md:tracking-[0.24em]">
              {primeiro} & {segundo}
            </p>
          </header>

          <FormConfirmacao
            token={token}
            confirmadoInicial={confirmadoInicial}
            mensagemInicial={mensagemInicial}
            acompanhantesConvite={acompanhantesConvite}
            acompanhantesSelecionadosInicial={acompanhantesSelecionadosInicial}
          />
        </div>
      </div>
    </InvitePageShell>
  );
}
