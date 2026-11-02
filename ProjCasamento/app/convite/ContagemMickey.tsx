"use client";

import { useEffect, useState } from "react";

/** Cronômetro compacto do convite Mickey; tamanhos seguem o cartão (container queries). */
export default function ContagemMickey({ alvo }: { alvo: number }) {
  const [diff, setDiff] = useState<number | null>(null);

  useEffect(() => {
    const atualizar = () => setDiff(Math.max(0, alvo - Date.now()));
    atualizar();
    const id = setInterval(atualizar, 1000);
    return () => clearInterval(id);
  }, [alvo]);

  if (diff === 0) {
    return (
      <p className="font-nomes-noivos font-bold text-black text-[max(0.9rem,3.3cqmin)] portrait:text-[max(1rem,4.4cqw)]">
        <span className="rounded-lg bg-[#FFC400] px-[1.6cqmin] py-[0.4cqmin]">É hoje!</span>
      </p>
    );
  }

  const d = diff ?? 0;
  const blocos = [
    { valor: Math.floor(d / 86_400_000), rotulo: "dias" },
    { valor: Math.floor((d % 86_400_000) / 3_600_000), rotulo: "horas" },
    { valor: Math.floor((d % 3_600_000) / 60_000), rotulo: "min" },
    { valor: Math.floor((d % 60_000) / 1000), rotulo: "seg" },
  ];

  return (
    <div
      className="flex items-center justify-center gap-[1.2cqmin] portrait:gap-[2cqw]"
      role="timer"
      aria-label="Contagem regressiva para a festa"
    >
      {blocos.map(({ valor, rotulo }, i) => (
        <div key={rotulo} className="flex items-center gap-[1.2cqmin] portrait:gap-[2cqw]">
          <div className="flex min-w-[max(2.6rem,8cqmin)] flex-col items-center rounded-xl border-[2.5px] border-black bg-[#FFC400] px-[1cqmin] py-[0.6cqmin] shadow-[0_3px_0_#111] portrait:min-w-[13cqw] portrait:py-[1cqw]">
            <span className="font-nomes-noivos font-bold leading-none tabular-nums text-black text-[max(1.05rem,4cqmin)] portrait:text-[max(1.2rem,6cqw)]">
              {diff === null ? "--" : String(valor).padStart(2, "0")}
            </span>
            <span className="font-sans font-semibold uppercase leading-tight tracking-wide text-black/75 text-[max(0.55rem,1.6cqmin)] portrait:text-[max(0.6rem,2.6cqw)]">
              {rotulo}
            </span>
          </div>
          {i < blocos.length - 1 ? (
            <span className="font-nomes-noivos font-bold text-invite-olive text-[max(1rem,3.4cqmin)]" aria-hidden>
              :
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}
