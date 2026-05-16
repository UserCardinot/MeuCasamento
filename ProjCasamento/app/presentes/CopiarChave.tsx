"use client";

import { presentesBtnPrimary } from "./presentesTheme";

export default function CopiarChave({ chave }: { chave: string }) {
  return (
    <button
      type="button"
      onClick={() => navigator.clipboard.writeText(chave)}
      className={`${presentesBtnPrimary} shrink-0 sm:w-auto sm:px-8`}
    >
      Copiar
    </button>
  );
}
