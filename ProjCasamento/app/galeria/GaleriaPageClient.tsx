"use client";

import Link from "next/link";
import { ConviteLogoImagem } from "@/app/convite/ConviteImagens";
import { EVENTO } from "@/lib/evento";
import { presentesColuna } from "@/app/presentes/presentesTheme";
import GaleriaClient from "./GaleriaClient";

type Props = {
  eventToken: string;
};

function MonogramaFallback() {
  const [l, b] = EVENTO.noivos.monograma;
  return (
    <div className="mx-auto flex h-16 w-16 items-center justify-center sm:h-20 sm:w-20" aria-hidden>
      <span className="font-nomes-noivos text-3xl leading-none text-invite-olive sm:text-4xl">
        {b}
        {l}
      </span>
    </div>
  );
}

export default function GaleriaPageClient({ eventToken }: Props) {
  const { primeiro, segundo } = EVENTO.noivos;
  const midiaHref = `/midia?eventToken=${encodeURIComponent(eventToken)}`;

  return (
    <div className={`${presentesColuna} w-full animate-[midiaFadeIn_0.65s_ease-out]`}>
      <header className="mb-6 text-center sm:mb-8">
        <div className="mb-3 flex justify-center scale-75 sm:mb-4 sm:scale-90 animate-[midiaLogoIn_0.7s_ease-out]">
          <ConviteLogoImagem
            alt={`Monograma ${segundo} & ${primeiro}`}
            fallback={<MonogramaFallback />}
          />
        </div>
        <p className="font-nomes-noivos text-[1.85rem] leading-none text-invite-olive sm:text-[2.25rem]">
          {primeiro} &amp; {segundo}
        </p>
        <h1 className="mt-2 font-sans text-sm font-medium tracking-wide text-invite-olive/80 sm:text-base">
          Álbum do casamento
        </h1>
        <p className="mx-auto mt-1.5 max-w-sm font-sans text-sm text-invite-olive/60">
          Toque para ampliar
        </p>
      </header>

      <div className="mb-6 grid grid-cols-2 border-b border-invite-olive/20">
        <Link
          href={midiaHref}
          className="py-2.5 text-center font-sans text-sm text-invite-olive/55 transition-colors hover:text-invite-olive"
        >
          Enviar
        </Link>
        <span className="border-b-2 border-invite-olive py-2.5 text-center font-sans text-sm font-semibold text-invite-olive">
          Ver álbum
        </span>
      </div>

      <GaleriaClient eventToken={eventToken} embedded />

      <p className="mt-10 text-center font-sans text-xs text-invite-olive/45">{EVENTO.dataFormatada}</p>
    </div>
  );
}
