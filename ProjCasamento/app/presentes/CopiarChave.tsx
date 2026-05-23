"use client";

import { useState } from "react";

type Props = {
  chave: string;
  rotulo?: string;
};

export default function CopiarChave({ chave, rotulo = "Copiar" }: Props) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(chave);
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2000);
    } catch {
      setCopiado(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copiar}
      className="font-invite-caps w-full border-2 border-invite-olive bg-invite-olive py-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-white shadow-sm transition-colors hover:bg-invite-olive/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-invite-olive"
    >
      {copiado ? "Copiado!" : rotulo}
    </button>
  );
}
