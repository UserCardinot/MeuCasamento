"use client";

export default function CopiarChave({ chave }: { chave: string }) {
  return (
    <button
      type="button"
      onClick={() => navigator.clipboard.writeText(chave)}
      className="px-3 py-2 bg-casamento-sage text-casamento-verde rounded text-sm font-medium hover:opacity-80 shrink-0"
    >
      Copiar
    </button>
  );
}
