"use client";

import Image from "next/image";
import { type ReactNode, useState } from "react";

/** Arquivos em `public/convite/` ou `NEXT_PUBLIC_CONVITE_*` no .env.local */
const SRC_LOGO = process.env.NEXT_PUBLIC_CONVITE_LOGO?.trim() || "/convite/logo.png";
const SRC_CAPA = process.env.NEXT_PUBLIC_CONVITE_CAPA?.trim() || "/convite/capa.png";

/**
 * `public/convite/logo.png` (500×500): recorte só do vazio vertical (top/bottom ~32%).
 * Largura do viewport = largura da imagem, para não cortar o desenho nas laterais.
 */
const LOGO_PNG = { w: 500, h: 500, top: 160, contentH: 180 } as const;
const logoViewport =
  "mx-auto shrink-0 overflow-hidden leading-[0] w-[var(--logo-d)] max-w-[min(100%,92vw)] h-[calc(var(--logo-d)*0.36)] [--logo-d:14rem] sm:[--logo-d:19.5rem] md:[--logo-d:22.5rem] lg:[--logo-d:min(26.5rem,78svh)]";

const logoImage =
  "mx-auto block h-[var(--logo-d)] w-[var(--logo-d)] max-w-[min(100%,92vw)] object-contain -mt-[calc(var(--logo-d)*0.32)]";

export function ConviteLogoImagem({ alt, fallback }: { alt: string; fallback: ReactNode }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <>{fallback}</>;
  return (
    <div className={logoViewport}>
      <Image
        src={SRC_LOGO}
        alt={alt}
        width={LOGO_PNG.w}
        height={LOGO_PNG.h}
        className={logoImage}
        onError={() => setFailed(true)}
        priority
      />
    </div>
  );
}

/**
 * Ocupa o restante da primeira tela (rodapé inteiro), fazendo a transição visual para a página 2 ao rolar.
 */
export function ConviteCapaTransicao({ alt, fallback }: { alt: string; fallback: ReactNode }) {
  const [failed, setFailed] = useState(false);

  /** Alturas dos fades (reuso nas camadas). */
  const hFadeTopo = "h-[min(28vh,11rem)] sm:h-[min(24vh,11.5rem)]";
  const hFadeBase = "h-[min(26vh,10rem)] sm:h-[min(22vh,10.5rem)]";

  /** Continuação visual da moldura: linhas verticais somem no meio da foto (mask) e voltam a aparecer na base. */
  const mascaraVerticaisMoldura =
    "linear-gradient(180deg, #000 0%, #000 4%, rgba(0,0,0,0.62) 16%, rgba(0,0,0,0.18) 34%, rgba(0,0,0,0) 48%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.14) 72%, rgba(0,0,0,0.55) 88%, #000 100%)";

  const molduraVerticalNaCapa = (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 top-0 z-[11] w-[1.25px] bg-[rgba(75,83,32,0.2)] sm:w-[1.5px]"
        style={{
          maskImage: mascaraVerticaisMoldura,
          WebkitMaskImage: mascaraVerticaisMoldura,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 top-0 z-[11] w-[1.25px] bg-[rgba(75,83,32,0.2)] sm:w-[1.5px]"
        style={{
          maskImage: mascaraVerticaisMoldura,
          WebkitMaskImage: mascaraVerticaisMoldura,
        }}
      />
    </>
  );

  /**
   * Alinha com a moldura verde (padding do `inviteColuna`), com pequena folga (~0,5rem) em cada
   * lateral para não colar nas barras. z-index alto mantém a foto por cima do traço onde encosta.
   */
  const shellClass =
    "relative z-[25] -mt-px mt-auto shrink-0 overflow-hidden min-h-[min(46svh,25rem)] max-h-[min(64svh,44rem)] w-[calc(100%+1.5rem+2px)] -mx-[calc(0.75rem+1px)] sm:w-[calc(100%+3rem+2px)] sm:-mx-[calc(1.5rem+1px)] md:w-[calc(100%+4rem+2px)] md:-mx-[calc(2rem+1px)] sm:min-h-[min(52svh,28rem)] sm:max-h-[min(72svh,50rem)]";

  const tijoloTopo = (
    <div
      aria-hidden
      className="invite-paper-texture-overlay pointer-events-none absolute inset-0 z-[18]"
    />
  );

  if (failed) {
    return (
      <div className={`${shellClass} border-t border-invite-olive/[0.05] bg-invite-cream`}>
        {fallback}
        {molduraVerticalNaCapa}
        {tijoloTopo}
      </div>
    );
  }

  return (
    <div className={`${shellClass} border-t border-invite-olive/[0.05] bg-invite-cream`}>
      <Image
        src={SRC_CAPA}
        alt={alt}
        fill
        className="object-cover object-[center_68%] opacity-60"
        sizes="(max-width: 768px) 100vw, 794px"
        onError={() => setFailed(true)}
        priority
      />
      {molduraVerticalNaCapa}
      {/* Fade topo: dissolve o papel do convite na imagem */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 top-0 z-[12] ${hFadeTopo} bg-[linear-gradient(180deg,#F0EBE1_0%,rgba(240,235,225,0.9)_18%,rgba(240,235,225,0.42)_52%,rgba(240,235,225,0.12)_82%,transparent_100%)]`}
      />
      {/* Fade base: transição suave para a próxima seção */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 bottom-0 z-[12] ${hFadeBase} bg-[linear-gradient(0deg,#F0EBE1_0%,rgba(240,235,225,0.88)_22%,rgba(240,235,225,0.35)_58%,transparent_100%)]`}
      />
      {tijoloTopo}
    </div>
  );
}
