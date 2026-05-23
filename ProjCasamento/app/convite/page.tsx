import type { ReactNode } from "react";
import Link from "next/link";
import { validateGuestToken } from "@/lib/auth";
import { getPresencaStatus } from "@/lib/google";
import BannerPresencaConvite from "./BannerPresencaConvite";

export const dynamic = "force-dynamic";
import ContagemRegressiva from "./ContagemRegressiva";
import { ConviteCapaTransicao, ConviteLogoImagem } from "./ConviteImagens";
import { EVENTO, getDataHoraConviteUppercase } from "@/lib/evento";

const COLOSSENSES_3_14_NVI =
  "Acima de tudo, porém, revistam\u2011se do amor, que é o elo perfeito.";

const CONVITE_PIX = {
  titular: "Nome: Lucas Cardinot da Silva",
  chave: "Chave: lucascardinot2000@gmail.com",
} as const;

/** Largura máxima do convite (~lateral da folha A4: 210 mm). */
const inviteColuna =
  "mx-auto w-full max-w-[210mm] px-5 sm:px-8 md:px-10";

const inviteAtalhoCirculoBtn =
  "flex h-[3.35rem] w-[3.35rem] shrink-0 items-center justify-center rounded-full bg-invite-olive text-white shadow-sm transition-transform hover:scale-[1.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-invite-olive sm:h-[3.6rem] sm:w-[3.6rem]";

const inviteAtalhoRotulo =
  "mt-2 max-w-[7.5rem] text-center font-invite-caps text-[0.72rem] font-medium uppercase leading-snug tracking-[0.09em] text-invite-olive sm:max-w-[8.5rem] sm:text-[0.78rem] sm:tracking-[0.1em] md:max-w-[9.5rem] md:text-[0.82rem]";

function NomesNoivosTitulo({
  primeiro,
  segundo,
  className = "",
}: {
  primeiro: string;
  segundo: string;
  className?: string;
}) {
  return (
    <h1
      className={`font-nomes-noivos w-full text-center leading-[1] text-invite-olive text-balance text-[clamp(4rem,13vw,7.25rem)] ${className}`}
    >
      {primeiro} <span className="text-[0.55em] font-normal">&amp;</span> {segundo}
    </h1>
  );
}

function Monograma({ a, b }: { a: string; b: string }) {
  return (
    <div
      className="mx-auto flex h-[6.25rem] w-[6.25rem] items-center justify-center rounded-full border-[1.5px] border-invite-olive text-invite-olive sm:h-[8rem] sm:w-[8rem] md:h-[8.75rem] md:w-[8.75rem]"
      aria-hidden
    >
      <span className="font-invite-caps text-2xl font-semibold tracking-[-0.2em] sm:text-3xl md:text-[2rem]">
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
  rotulo: ReactNode;
  children: ReactNode;
}) {
  const inner = (
    <>
      <span className={inviteAtalhoCirculoBtn}>{children}</span>
      <span className={`${inviteAtalhoRotulo} flex min-h-[2.75rem] flex-col justify-center sm:min-h-[3rem]`}>
        {rotulo}
      </span>
    </>
  );

  if (externo) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Como chegar"
        className="flex shrink-0 flex-col items-center"
      >
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className="flex shrink-0 flex-col items-center">
      {inner}
    </Link>
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

/** Ícone alusivo ao Pix (carteira digital; não reproduz a marca oficial). */
function IconePix() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 9h14a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M5 9V8a2 2 0 012-2h10a2 2 0 012 2v1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M5 13h14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity={0.9} />
      <circle cx="16.5" cy="14.5" r="1.35" fill="currentColor" />
    </svg>
  );
}

function BlocoPixInformativo({ titular, chave }: { titular: string; chave: string }) {
  return (
    <div
      className="flex w-full max-w-[18rem] flex-col items-center sm:max-w-[20rem]"
      role="group"
      aria-label={`Pix: titular ${titular}, chave ${chave}`}
    >
      <span className={`${inviteAtalhoCirculoBtn} pointer-events-none`}>
        <IconePix />
      </span>
      <div className="mt-3 w-full border border-invite-olive/35 px-3 py-3 text-center sm:px-4 sm:py-4">
        <p className="mt-0 w-full text-center font-invite-caps text-[0.8rem] font-semibold uppercase tracking-[0.1em] text-invite-olive sm:text-[0.85rem] sm:tracking-[0.12em]">
          Pix
        </p>
        <p className="font-sans mt-2.5 text-[0.82rem] font-medium normal-case leading-snug text-invite-olive sm:text-[0.86rem]">
          {titular}
        </p>
        <p className="font-sans mt-1.5 break-all text-[0.82rem] font-medium normal-case leading-snug text-invite-olive/90 sm:text-[0.86rem]">
          {chave}
        </p>
      </div>
    </div>
  );
}

type Props = {
  searchParams: Promise<{ token?: string | string[] }> | { token?: string | string[] };
};

function ErroConvite({ mensagem, detalhe }: { mensagem: string; detalhe?: string }) {
  return (
    <main className="invite-wall-texture-bg flex min-h-screen flex-col items-center justify-center py-24">
      <div className={inviteColuna}>
        <div className="mx-auto max-w-lg border border-invite-olive/80 px-8 py-12 text-center">
          <p className="font-invite-caps text-invite-olive text-lg font-medium tracking-wide">{mensagem}</p>
          {detalhe && <p className="mt-4 font-sans text-sm text-invite-olive/80">{detalhe}</p>}
        </div>
      </div>
    </main>
  );
}

/** Rodapé inteiro da página 1 até existir `public/convite/capa.jpg` (ou NEXT_PUBLIC_CONVITE_CAPA). */
function ConviteCapaPlaceholder() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center border-t border-dashed border-invite-olive/35 bg-invite-olive/[0.04] px-6 py-16">
      <p className="font-invite-caps max-w-[13rem] text-center text-[0.5rem] font-medium uppercase leading-relaxed tracking-[0.18em] text-invite-olive/55">
        Foto de transição para a próxima página — coloque capa.jpg em public/convite
      </p>
    </div>
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

  const presenca = await getPresencaStatus(token);
  const respondeuPresenca = presenca !== null;
  const presencaConfirmada = presenca?.confirmado === true;

  const { primeiro, segundo, monograma } = EVENTO.noivos;
  return (
    <main className="invite-wall-texture-bg min-h-screen pb-[max(2rem,env(safe-area-inset-bottom,0px))] sm:pb-10">
      <div className={`${inviteColuna} relative pb-6 sm:pb-8`}>
        {/* Moldura lateral/inferior (atrás do conteúdo). Sem border-top: o fundo do conteúdo cobria o traço no meio. */}
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-4 left-4 right-4 top-4 z-[5] border-x border-b border-invite-olive sm:bottom-5 sm:inset-x-0 sm:top-5 md:bottom-6 md:top-6"
        />
        {/* Traço superior contínuo, por cima do fundo das seções */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-4 right-4 top-4 z-[12] h-px bg-invite-olive sm:inset-x-0 sm:top-5 md:top-6"
        />
        <div className="relative z-10 flex flex-col">
          <section className="flex min-h-[100svh] w-full max-w-none flex-col">
            <div className="flex min-h-0 w-full flex-1 flex-col justify-center pb-0">
              <div className="flex w-full translate-y-5 flex-col items-center sm:translate-y-6 md:translate-y-7">
                <header className="flex w-full shrink-0 flex-col items-center gap-3 sm:gap-4 md:gap-5">
                  <div className="-translate-y-7 sm:-translate-y-8 md:-translate-y-10">
                    <ConviteLogoImagem
                      alt={`Casamento ${primeiro} & ${segundo}`}
                      fallback={<Monograma a={monograma[0]} b={monograma[1]} />}
                    />
                  </div>
                  <NomesNoivosTitulo primeiro={primeiro} segundo={segundo} className="w-full px-1" />
                </header>
                <div className="mx-auto flex w-full max-w-full shrink-0 translate-y-11 flex-col items-center px-0 pt-6 sm:max-w-xl sm:translate-y-14 sm:pt-7 md:max-w-3xl md:translate-y-16 md:pt-8">
                  <blockquote className="mx-auto w-full max-w-[30rem] shrink-0 px-1 text-center sm:max-w-xl md:max-w-xl sm:px-3">
                    <p className="font-heading text-[0.98rem] italic leading-snug text-invite-olive sm:text-[1.22rem] md:text-[1.35rem] sm:leading-relaxed">
                      {"\u201c"}
                      {COLOSSENSES_3_14_NVI}
                      {"\u201d"}
                    </p>
                    <footer className="font-invite-caps mt-4 text-[0.65rem] font-medium uppercase tracking-[0.15em] text-invite-olive sm:mt-5 sm:text-[0.78rem] sm:tracking-[0.18em] md:mt-6 md:text-[0.85rem] md:tracking-[0.2em]">
                      Colossenses 3:14
                    </footer>
                  </blockquote>
                  <div className="mt-2 flex shrink-0 flex-col items-center text-invite-olive/40 sm:mt-3" aria-hidden>
                    <svg width="20" height="28" viewBox="0 0 24 40" fill="none" className="opacity-70">
                      <path
                        d="M12 6v26M12 26l6-7M12 26l-6-7"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <ConviteCapaTransicao
              alt={`${primeiro} e ${segundo}`}
              fallback={<ConviteCapaPlaceholder />}
            />
          </section>

          <section className="flex flex-col items-center justify-start pt-4 pb-4 sm:pt-5 sm:pb-5 md:pt-6">
            <div className="w-full pb-2 sm:pb-3">
              <ConviteLogoImagem
                alt={`Casamento ${primeiro} & ${segundo}`}
                fallback={<Monograma a={monograma[0]} b={monograma[1]} />}
              />
              <div className="mt-4 mb-5 flex w-full flex-col items-center sm:mt-5 sm:mb-6">
                <ContagemRegressiva variant="invite" compact />
              </div>
              <p className="font-invite-caps mx-auto mt-7 max-w-[18rem] text-center text-[0.88rem] font-bold uppercase leading-relaxed tracking-[0.1em] text-balance text-invite-olive sm:mt-9 sm:max-w-[22rem] sm:text-[0.96rem] sm:tracking-[0.11em] md:max-w-[24rem] md:text-[1.02rem] md:tracking-[0.12em]">
                Com as benções de Deus
              </p>

              <p className="font-invite-caps mx-auto mt-8 max-w-[22rem] text-center text-[0.94rem] font-medium uppercase leading-relaxed tracking-[0.13em] text-invite-olive sm:max-w-[26rem] sm:text-[1.05rem] sm:tracking-[0.15em] md:max-w-[28rem] md:text-[1.14rem]">
                Convidamos você para celebrar o nosso casamento
              </p>

              <p className="font-invite-caps mt-8 text-center text-[0.9rem] font-medium uppercase leading-relaxed tracking-[0.11em] text-invite-olive sm:text-[1rem] sm:tracking-[0.13em] md:text-[1.08rem]">
                {getDataHoraConviteUppercase()}
              </p>

              <p className="font-invite-caps mt-10 text-center text-[1.12rem] font-bold uppercase tracking-[0.15em] text-invite-olive sm:text-[1.24rem] sm:tracking-[0.17em] md:text-[1.36rem]">
                {EVENTO.local.nome}
              </p>
              <p className="font-invite-caps mx-auto mt-3 max-w-[20rem] text-center text-[0.84rem] font-medium uppercase leading-relaxed tracking-[0.09em] text-invite-olive/95 sm:max-w-[24rem] sm:text-[0.92rem] md:max-w-[26rem] md:text-[0.98rem]">
                {EVENTO.local.endereco}
              </p>

            </div>
          </section>

          <section className="flex flex-col justify-start pt-2 pb-14 sm:pt-3 sm:pb-16 md:pb-[4.5rem]">
            <div className="w-full py-4 sm:py-6">
              <BannerPresencaConvite
                token={token}
                respondeuInicial={respondeuPresenca}
                confirmadoInicial={presencaConfirmada}
              />

              <div
                className="mx-auto w-full max-w-[24rem] sm:max-w-[26rem] md:max-w-[28rem]"
              >
                <div
                  role="navigation"
                  aria-label="Atalhos do convite e dados do Pix"
                  className="flex flex-col items-stretch gap-y-9 sm:gap-y-10"
                >
                  <div
                    className={
                      EVENTO.local.mapUrl
                        ? "grid w-full grid-cols-3 gap-x-2 sm:gap-x-3 md:gap-x-4"
                        : "grid w-full grid-cols-2 gap-x-3 sm:gap-x-5"
                    }
                  >
                    <div className="flex min-w-0 justify-center">
                      <IconeCirculo href={`/confirmacao?token=${encodeURIComponent(token)}`} rotulo="Confirmar presença">
                        <IconeCheck />
                      </IconeCirculo>
                    </div>
                    <div className="flex min-w-0 justify-center">
                      <IconeCirculo href={`/presentes?token=${encodeURIComponent(token)}`} rotulo="Lista de presentes">
                        <IconePresente />
                      </IconeCirculo>
                    </div>
                    {EVENTO.local.mapUrl ? (
                      <div className="flex min-w-0 justify-center">
                        <IconeCirculo
                          href={EVENTO.local.mapUrl}
                          externo
                          rotulo={
                            <>
                              <span className="block">Como</span>
                              <span className="block">chegar</span>
                            </>
                          }
                        >
                          <IconePin />
                        </IconeCirculo>
                      </div>
                    ) : null}
                  </div>
                  <div className="flex w-full justify-center pt-6 sm:pt-7">
                    <BlocoPixInformativo titular={CONVITE_PIX.titular} chave={CONVITE_PIX.chave} />
                  </div>
                </div>
              </div>

              <div className="mt-10 flex justify-center sm:mt-12">
                <Link
                  href={`/recados?token=${encodeURIComponent(token)}`}
                  className="inline-flex min-h-[3.5rem] min-w-[12.5rem] items-center justify-center rounded-full border-2 border-invite-olive bg-invite-olive px-10 py-3.5 font-invite-caps text-[0.95rem] font-semibold uppercase tracking-[0.14em] text-white shadow-md transition-transform hover:scale-[1.03] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-invite-olive sm:min-h-[3.75rem] sm:min-w-[14rem] sm:px-12 sm:text-[1.02rem] sm:tracking-[0.16em] md:text-[1.08rem]"
                >
                  Deixar recado
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
