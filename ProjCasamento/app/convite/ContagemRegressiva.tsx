"use client";

import { useState, useEffect } from "react";
import { getEventoTimestamp } from "@/lib/evento";

type Props = { variant?: "default" | "invite" };

export default function ContagemRegressiva({ variant = "default" }: Props) {
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

  return (
    <div className="max-w-3xl mx-auto">
      <p
        className={
          invite
            ? "font-invite-caps text-invite-olive/60 text-[0.65rem] uppercase tracking-[0.35em] mb-8 text-center"
            : "font-sans text-stone-400 text-xs uppercase tracking-widest mb-8 text-center"
        }
      >
        Contagem regressiva
      </p>
      <div className="flex justify-center gap-4 sm:gap-8 flex-wrap">
        {blocos.map(({ valor, label }) => (
          <div
            key={label}
            className={
              invite
                ? "flex flex-col items-center min-w-[5rem] sm:min-w-[6rem] py-5 px-4 bg-white/90 border border-invite-olive/20 rounded-xl shadow-sm"
                : "flex flex-col items-center min-w-[5rem] sm:min-w-[6rem] py-6 px-4 bg-white rounded-2xl shadow-sm"
            }
          >
            <span
              className={
                invite
                  ? "font-invite-caps text-3xl sm:text-4xl font-semibold text-invite-olive tabular-nums"
                  : "font-heading text-4xl sm:text-5xl font-light text-casamento-oliva-escuro tabular-nums"
              }
            >
              {String(valor).padStart(2, "0")}
            </span>
            <span
              className={
                invite
                  ? "font-invite-caps text-[0.6rem] text-invite-olive/70 uppercase tracking-[0.2em] mt-2"
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
