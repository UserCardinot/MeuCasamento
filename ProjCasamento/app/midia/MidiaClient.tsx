"use client";

import Link from "next/link";
import { useState } from "react";
import { ConviteLogoImagem } from "@/app/convite/ConviteImagens";
import { EVENTO } from "@/lib/evento";
import { presentesColuna } from "@/app/presentes/presentesTheme";
import UploadFotos from "./UploadFotos";
import GravarAudio from "./GravarAudio";

type Aba = "fotos" | "audio";

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

export default function MidiaClient({ eventToken }: Props) {
  const [aba, setAba] = useState<Aba>("fotos");
  const { primeiro, segundo } = EVENTO.noivos;
  const albumHref = `/galeria?eventToken=${encodeURIComponent(eventToken)}`;

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
          Enviar para o álbum
        </h1>
      </header>

      <div className="mb-6 grid grid-cols-2 border-b border-invite-olive/20">
        <span className="border-b-2 border-invite-olive py-2.5 text-center font-sans text-sm font-semibold text-invite-olive">
          Enviar
        </span>
        <Link
          href={albumHref}
          className="py-2.5 text-center font-sans text-sm text-invite-olive/55 transition-colors hover:text-invite-olive"
        >
          Ver álbum
        </Link>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-2">
        <button
          type="button"
          aria-pressed={aba === "fotos"}
          onClick={() => setAba("fotos")}
          className={`px-3 py-2.5 font-sans text-sm font-medium transition-colors ${
            aba === "fotos"
              ? "bg-invite-olive text-white"
              : "border border-invite-olive/35 bg-white/60 text-invite-olive hover:border-invite-olive/55"
          }`}
        >
          Foto / vídeo
        </button>
        <button
          type="button"
          aria-pressed={aba === "audio"}
          onClick={() => setAba("audio")}
          className={`px-3 py-2.5 font-sans text-sm font-medium transition-colors ${
            aba === "audio"
              ? "bg-invite-olive text-white"
              : "border border-invite-olive/35 bg-white/60 text-invite-olive hover:border-invite-olive/55"
          }`}
        >
          Áudio
        </button>
      </div>

      <div key={aba} className="animate-[midiaPanel_0.35s_ease-out]">
        {aba === "fotos" && (
          <section aria-label="Enviar foto ou vídeo">
            <UploadFotos eventToken={eventToken} />
          </section>
        )}
        {aba === "audio" && (
          <section aria-label="Gravar áudio">
            <GravarAudio eventToken={eventToken} />
          </section>
        )}
      </div>

      <p className="mt-10 text-center font-sans text-xs text-invite-olive/45">{EVENTO.dataFormatada}</p>
    </div>
  );
}
