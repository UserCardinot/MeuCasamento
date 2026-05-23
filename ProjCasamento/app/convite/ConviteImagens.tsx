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
  "mx-auto shrink-0 overflow-hidden leading-[0] w-[var(--logo-d)] max-w-[min(100%,92vw)] h-[calc(var(--logo-d)*0.36)] [--logo-d:9rem] sm:[--logo-d:12.75rem] md:[--logo-d:15.5rem] lg:[--logo-d:min(18rem,62svh)]";

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

  /** Quinas arredondadas (raio pequeno) + fade forte em cima/baixo; laterais mais curtas. */
  const capaClip = "absolute inset-0 overflow-hidden rounded-md sm:rounded-lg";
  const capaMascaraArestas =
    "[mask-image:linear-gradient(to_bottom,transparent_0%,#000_5%,#000_95%,transparent_100%),linear-gradient(to_right,transparent_0%,#000_10%,#000_90%,transparent_100%)] [-webkit-mask-composite:source-in] [mask-composite:intersect] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,#000_5%,#000_95%,transparent_100%),linear-gradient(to_right,transparent_0%,#000_10%,#000_90%,transparent_100%)]";

  /**
   * Largura até as verticais da moldura do convite (`left-4` no mobile; `inset-x-0` em sm+),
   * compensando o padding horizontal do `inviteColuna` (px-5 / sm:px-8 / md:px-10).
   */
  const shellClass =
    "relative z-[4] -mt-px mt-auto shrink-0 overflow-hidden min-h-[min(46svh,25rem)] max-h-[min(64svh,44rem)] w-[calc(100%+0.5rem)] -mx-[0.25rem] sm:w-[calc(100%+4rem)] sm:-mx-[2rem] md:w-[calc(100%+5rem)] md:-mx-[2.5rem] sm:min-h-[min(52svh,28rem)] sm:max-h-[min(72svh,50rem)]";

  if (failed) {
    return (
      <div className={`${shellClass} bg-transparent`}>
        {fallback}
      </div>
    );
  }

  return (
    <div className={`${shellClass} bg-transparent`}>
      <div className={capaClip}>
        <div className={`absolute inset-0 ${capaMascaraArestas}`}>
        <Image
          src={SRC_CAPA}
          alt={alt}
          fill
          className="object-cover object-[center_68%] opacity-45"
          sizes="(max-width: 768px) 100vw, 794px"
          onError={() => setFailed(true)}
          priority
        />
        </div>
      </div>
    </div>
  );
}
