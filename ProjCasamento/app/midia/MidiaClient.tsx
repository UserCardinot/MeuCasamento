"use client";

import { useState } from "react";
import { ConviteLogoImagem } from "@/app/convite/ConviteImagens";
import { EVENTO } from "@/lib/evento";
import {
  presentesCard,
  presentesColuna,
  presentesLabelClass,
} from "@/app/presentes/presentesTheme";
import UploadFotos from "./UploadFotos";
import GravarAudio from "./GravarAudio";
import GaleriaClient from "@/app/galeria/GaleriaClient";

type Aba = "fotos" | "audio" | "galeria";

type Props = {
  eventToken: string;
};

function MonogramaFallback() {
  const [l, b] = EVENTO.noivos.monograma;
  return (
    <div
      className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-invite-olive/50 sm:h-24 sm:w-24"
      aria-hidden
    >
      <span className="font-nomes-noivos text-3xl leading-none text-invite-olive sm:text-4xl">
        {b}
        {l}
      </span>
    </div>
  );
}

function tabClass(ativa: boolean) {
  return `font-invite-caps flex-1 border px-2 py-3.5 text-center text-[0.65rem] font-semibold uppercase tracking-[0.12em] transition-all sm:px-4 sm:text-[0.72rem] sm:tracking-[0.14em] md:py-4 md:text-xs ${
    ativa
      ? "border-invite-olive bg-invite-olive text-white shadow-sm"
      : "border-invite-olive/30 bg-white/70 text-invite-olive hover:border-invite-olive/50"
  }`;
}

export default function MidiaClient({ eventToken }: Props) {
  const [aba, setAba] = useState<Aba>("fotos");
  const { primeiro, segundo } = EVENTO.noivos;

  return (
    <div className={`${presentesColuna} w-full animate-[midiaFadeIn_0.6s_ease-out]`}>
      <header className="mb-8 text-center sm:mb-10 md:mb-12">
        <div className="mb-5 flex justify-center sm:mb-6 [&_[class*='logo']]:opacity-95">
          <div className="scale-90 sm:scale-100">
            <ConviteLogoImagem alt={`Monograma ${segundo} & ${primeiro}`} fallback={<MonogramaFallback />} />
          </div>
        </div>

        <p className="font-invite-caps text-[0.68rem] font-medium uppercase tracking-[0.28em] text-invite-olive/80 sm:text-xs md:tracking-[0.32em]">
          Álbum do casamento
        </p>
        <h1 className="font-heading mt-3 text-[1.75rem] italic leading-snug text-invite-olive sm:mt-4 sm:text-[2.1rem] md:text-[2.5rem]">
          Fotos &amp; mensagens
        </h1>
        <p className="font-nomes-noivos mt-2 text-2xl text-invite-olive/90 sm:text-3xl">
          {primeiro} &amp; {segundo}
        </p>
        <p className="mx-auto mt-4 max-w-md font-sans text-sm leading-relaxed text-invite-olive/75 sm:text-[0.95rem]">
          Compartilhe um instante conosco. O álbum organiza as fotos pelo horário em que foram
          tiradas — pode enviar depois, se a internet oscilar.
        </p>
      </header>

      <div className={`${presentesCard} overflow-hidden`}>
        <div
          role="tablist"
          aria-label="Seções de mídia"
          className="grid grid-cols-3 gap-0 border-b border-invite-olive/20"
        >
          {(
            [
              { id: "fotos" as const, label: "Fotos" },
              { id: "audio" as const, label: "Áudio" },
              { id: "galeria" as const, label: "Galeria" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={aba === t.id}
              aria-controls={`panel-${t.id}`}
              onClick={() => setAba(t.id)}
              className={tabClass(aba === t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="px-5 py-8 sm:px-8 sm:py-10 md:px-10 md:py-12">
          {aba === "fotos" && (
            <div
              role="tabpanel"
              id="panel-fotos"
              aria-labelledby="tab-fotos"
              className="animate-[midiaPanel_0.35s_ease-out]"
            >
              <p className={presentesLabelClass}>Enviar fotos e vídeos</p>
              <p className="mb-6 font-sans text-sm leading-relaxed text-invite-olive/70">
                Tire pela câmera ou escolha da galeria. Vá montando a lista e envie tudo de uma vez.
                Fotos são compactadas no celular · vídeos curtos (até ~3,8&nbsp;MB).
              </p>
              <UploadFotos eventToken={eventToken} />
            </div>
          )}

          {aba === "audio" && (
            <div
              role="tabpanel"
              id="panel-audio"
              aria-labelledby="tab-audio"
              className="animate-[midiaPanel_0.35s_ease-out]"
            >
              <p className={presentesLabelClass}>Gravar mensagem</p>
              <p className="mb-6 font-sans text-sm leading-relaxed text-invite-olive/70">
                Até 1 minuto. Deixe um carinho em voz para os noivos.
              </p>
              <GravarAudio eventToken={eventToken} />
            </div>
          )}

          {aba === "galeria" && (
            <div
              role="tabpanel"
              id="panel-galeria"
              aria-labelledby="tab-galeria"
              className="animate-[midiaPanel_0.35s_ease-out]"
            >
              <p className={presentesLabelClass}>Momentos compartilhados</p>
              <p className="mb-6 font-sans text-sm leading-relaxed text-invite-olive/70">
                Fotos enviadas pelos convidados. Toque para abrir no Drive.
              </p>
              <GaleriaClient eventToken={eventToken} embedded />
            </div>
          )}
        </div>
      </div>

      <p className="mt-8 text-center font-invite-caps text-[0.62rem] uppercase tracking-[0.2em] text-invite-olive/55 sm:text-[0.68rem]">
        {EVENTO.dataFormatada}
      </p>
    </div>
  );
}
