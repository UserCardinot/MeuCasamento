"use client";

import { useState, useEffect } from "react";
import { getEventoTimestamp } from "@/lib/evento";

type Props = { variant?: "default" | "invite"; compact?: boolean };

export default function ContagemRegressiva({ variant = "default", compact = false }: Props) {
  const [diff, setDiff] = useState<number | null>(null);
  const alvo = getEventoTimestamp();

  useEffect(() => {
    function atualizar() {
      const now = Date.now();
      setDiff(Math.max(0, alvo - now));
    }
    atualizar();
    const id = setInterval(atualizar, 1000);
    return () => clearInterval(id);
  }, [alvo]);

  if (diff === null || diff <= 0) return null;

  const dias = Math.floor(diff / (24 * 60 * 60 * 1000));
  const h = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const m = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
  const s = Math.floor((diff % (60 * 1000)) / 1000);

  const blocos = [
    { valor: dias, label: "dias" },
    { valor: h, label: "horas" },
    { valor: m, label: "min" },
    { valor: s, label: "seg" },
  ];

  const invite = variant === "invite";
  const tituloMb = invite && compact ? "mb-3 sm:mb-4" : invite ? "mb-8" : "mb-8";
  const blocoPy = invite && compact ? "py-2 sm:py-4 md:py-5" : invite ? "py-5" : "py-6";
  const blocoInvite = invite
    ? compact
      ? "min-w-0 flex-1 basis-0 px-1 py-2 sm:min-w-[5.25rem] sm:flex-none sm:basis-auto sm:px-3.5 sm:py-4 md:min-w-[7rem] md:px-4 border-2 border-invite-olive/40 bg-invite-cream shadow-md"
      : "min-w-[5rem] sm:min-w-[6rem] px-4 border-2 border-invite-olive/35 bg-invite-cream/95 shadow-sm"
    : "";
  const tituloInvite = invite
    ? compact
      ? "text-[1.05rem] font-semibold text-invite-olive tracking-[0.22em] sm:text-[1.15rem] sm:tracking-[0.26em] md:text-[1.22rem]"
      : "text-[0.95rem] font-semibold text-invite-olive tracking-[0.3em] sm:text-[1.05rem]"
    : "";
  const labelInvite = invite
    ? compact
      ? "mt-1 text-[0.55rem] font-medium text-invite-olive tracking-[0.1em] sm:mt-2.5 sm:text-[0.88rem] sm:tracking-[0.14em] md:text-[1rem]"
      : "mt-2 text-[0.72rem] font-medium text-invite-olive/90 tracking-[0.18em] sm:text-[0.8rem]"
    : "";
  const numeroInvite = invite
    ? compact
      ? "text-2xl font-bold sm:text-5xl md:text-6xl"
      : "text-4xl font-bold sm:text-5xl"
    : "";

  return (
    <div className={`mx-auto w-full ${invite && compact ? "max-w-[19.5rem] px-0.5 sm:max-w-3xl sm:px-0" : "max-w-3xl"}`}>
      <p
        className={
          invite
            ? `font-invite-caps uppercase text-center ${tituloMb} ${tituloInvite}`
            : `font-sans text-stone-400 text-xs uppercase tracking-widest mb-8 text-center`
        }
      >
        Contagem regressiva
      </p>
      <div
        className={`flex justify-center ${invite && compact ? "flex-nowrap gap-1 sm:flex-wrap sm:gap-5 md:gap-6" : "flex-wrap gap-4 sm:gap-8"}`}
      >
        {blocos.map(({ valor, label }) => (
          <div
            key={label}
            className={
              invite
                ? `flex flex-col items-center rounded-xl ${blocoInvite} ${blocoPy}`
                : `flex flex-col items-center min-w-[5rem] sm:min-w-[6rem] py-6 px-4 bg-white rounded-2xl shadow-sm`
            }
          >
            <span
              className={
                invite
                  ? `font-invite-caps text-invite-olive tabular-nums ${numeroInvite}`
                  : "font-heading text-4xl sm:text-5xl font-light text-casamento-oliva-escuro tabular-nums"
              }
            >
              {String(valor).padStart(2, "0")}
            </span>
            <span
              className={
                invite
                  ? `font-invite-caps uppercase ${labelInvite}`
                  : "font-sans text-xs text-stone-500 uppercase tracking-wider mt-2"
              }
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
