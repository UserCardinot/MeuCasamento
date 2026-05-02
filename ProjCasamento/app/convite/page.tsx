import type { ReactNode } from "react";
import Link from "next/link";
import { validateGuestToken } from "@/lib/auth";
import { getConvidadoByToken, getPresencaStatus } from "@/lib/google";
import StatusPresenca from "./StatusPresenca";
import ContagemRegressiva from "./ContagemRegressiva";
import { EVENTO, getDataHoraConviteUppercase } from "@/lib/evento";

function Monograma({ a, b }: { a: string; b: string }) {
  return (
    <div
      className="mx-auto mb-8 flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full border-[1.5px] border-invite-olive text-invite-olive sm:h-[5rem] sm:w-[5rem]"
      aria-hidden
    >
      <span className="font-invite-caps text-2xl font-semibold tracking-[-0.2em] sm:text-3xl">
        <span className="inline-block translate-x-0.5">{a}</span>
        <span className="inline-block -translate-x-1">{b}</span>
      </span>
    </div>
  );
}

function IconeCirculo({
  href,
  externo,
  rotulo,
  children,
}: {
  href: string;
  externo?: boolean;
  rotulo: string;
  children: ReactNode;
}) {
  const classBtn =
    "flex h-[3.25rem] w-[3.25rem] shrink-0 items-center justify-center rounded-full bg-invite-olive text-white shadow-sm transition-transform hover:scale-[1.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-invite-olive";
  const classLabel =
    "mt-2 max-w-[4.75rem] text-center font-invite-caps text-[0.55rem] font-medium uppercase leading-tight tracking-[0.12em] text-invite-olive sm:text-[0.6rem] sm:tracking-[0.14em]";

  const inner = (
    <>
      <span className={classBtn}>{children}</span>
      <span className={classLabel}>{rotulo}</span>
    </>
  );

  if (externo) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center">
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className="flex flex-col items-center">
      {inner}
    </Link>
  );
}

function IconeGlobo() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" />
      <ellipse cx="12" cy="12" rx="4" ry="9" stroke="currentColor" strokeWidth="1.2" />
      <path d="M3 12h18M12 3c2 3 2 15 0 18" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function IconeCheck() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 12.5l4 4 8-9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconePresente() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 10h16v10H4V10z" stroke="currentColor" strokeWidth="1.4" />
      <path d="M12 10V20M4 10h16" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M12 6c-1.5 0-3 1-3 3h6c0-2-1.5-3-3-3zm0 0V10"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconePin() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21s7-4.5 7-11a7 7 0 10-14 0c0 6.5 7 11 7 11z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.2" fill="currentColor" />
    </svg>
  );
}

type Props = {
  searchParams: Promise<{ token?: string | string[] }> | { token?: string | string[] };
};

function ErroConvite({ mensagem, detalhe }: { mensagem: string; detalhe?: string }) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-24 bg-invite-cream">
      <div className="max-w-lg border border-invite-olive/80 px-8 py-12 text-center">
        <p className="font-invite-caps text-invite-olive text-lg font-medium tracking-wide">{mensagem}</p>
        {detalhe && <p className="mt-4 font-sans text-sm text-invite-olive/80">{detalhe}</p>}
      </div>
    </main>
  );
}

export default async function ConvitePage({ searchParams }: Props) {
  const params = await searchParams;
  const raw = params?.token;
  const token = (typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : undefined)
    ?.toString()
    .trim();

  if (!token) {
    return <ErroConvite mensagem="Link inválido." detalhe="Acesse através do link do seu convite." />;
  }

  const isValid = await validateGuestToken(token);
  if (!isValid) {
    return (
      <ErroConvite
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
  const jaConfirmou = presenca?.confirmado === true;

  const { primeiro, segundo, monograma } = EVENTO.noivos;
  const papelStyle = {
    backgroundColor: "#FDFDFB",
    backgroundImage:
      "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(75,83,32,0.025) 3px, rgba(75,83,32,0.025) 4px)",
  };

  return (
    <main className="min-h-screen bg-invite-cream">
      <section className="px-4 py-10 sm:px-6 sm:py-14 lg:py-16" style={papelStyle}>
        <div className="mx-auto max-w-md border border-invite-olive px-5 py-10 sm:px-8 sm:py-12">
          <Monograma a={monograma[0]} b={monograma[1]} />

          <p className="font-invite-caps text-center text-[0.65rem] font-medium uppercase tracking-[0.35em] text-invite-olive sm:text-xs sm:tracking-[0.4em]">
            Com grande prazer
          </p>

          <h1 className="font-invite-script mt-5 text-center text-[2.35rem] leading-none text-invite-olive sm:text-[2.85rem]">
            {primeiro} <span className="text-[0.55em] font-normal">&amp;</span> {segundo}
          </h1>

          <p className="font-invite-caps mx-auto mt-8 max-w-[17rem] text-center text-[0.7rem] font-medium uppercase leading-relaxed tracking-[0.18em] text-invite-olive sm:max-w-none sm:text-[0.72rem] sm:tracking-[0.2em]">
            Convidam você para celebrar o nosso casamento
          </p>

          <p className="font-invite-caps mt-8 text-center text-[0.68rem] font-medium uppercase leading-relaxed tracking-[0.14em] text-invite-olive sm:text-[0.72rem] sm:tracking-[0.16em]">
            {getDataHoraConviteUppercase()}
          </p>

          <p className="font-invite-caps mt-10 text-center text-sm font-semibold uppercase tracking-[0.22em] text-invite-olive sm:text-base sm:tracking-[0.26em]">
            {EVENTO.local.nome}
          </p>
          <p className="font-invite-caps mx-auto mt-3 max-w-[16rem] text-center text-[0.62rem] font-medium uppercase leading-relaxed tracking-[0.12em] text-invite-olive/95 sm:max-w-[18rem] sm:text-[0.65rem]">
            {EVENTO.local.endereco}
          </p>

          {jaConfirmou && (
            <div className="mt-10 border border-invite-olive/25 bg-white/50 px-4 py-5">
              <StatusPresenca token={token} />
            </div>
          )}

          <nav
            className="mt-12 flex flex-wrap justify-center gap-x-5 gap-y-10 sm:gap-x-8"
            aria-label="Atalhos do convite"
          >
            <IconeCirculo href="/" rotulo="Site dos noivos">
              <IconeGlobo />
            </IconeCirculo>
            <IconeCirculo href={`/confirmacao?token=${encodeURIComponent(token)}`} rotulo="Confirmação">
              <IconeCheck />
            </IconeCirculo>
            <IconeCirculo href={`/presentes?token=${encodeURIComponent(token)}`} rotulo="Lista de presentes">
              <IconePresente />
            </IconeCirculo>
            {EVENTO.local.mapUrl ? (
              <IconeCirculo href={EVENTO.local.mapUrl} externo rotulo="Como chegar">
                <IconePin />
              </IconeCirculo>
            ) : null}
          </nav>

          <p className="font-invite-caps mx-auto mt-10 max-w-[15rem] text-center text-[0.55rem] font-medium uppercase leading-relaxed tracking-[0.2em] text-invite-olive/75 sm:max-w-none sm:text-[0.58rem]">
            Clique nos ícones acima para ser redirecionado.
          </p>

          <p className="mt-6 text-center">
            <Link
              href={`/recados?token=${encodeURIComponent(token)}`}
              className="font-invite-caps text-[0.58rem] font-medium uppercase tracking-[0.2em] text-invite-olive/80 underline-offset-4 hover:text-invite-olive hover:underline"
            >
              Deixar recado
            </Link>
          </p> 
        </div>
      </section>

      <section className="border-t border-invite-olive/15 bg-invite-cream px-6 py-14 sm:px-10 sm:py-20">
        <ContagemRegressiva variant="invite" />
      </section>
    </main>
  );
}
