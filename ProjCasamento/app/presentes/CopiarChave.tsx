"use client";

export default function CopiarChave({ chave }: { chave: string }) {
  return (
    <button
      type="button"
      onClick={() => navigator.clipboard.writeText(chave)}
      className="px-5 py-3 bg-casamento-oliva-escuro text-white rounded-2xl text-sm font-sans font-medium hover:bg-casamento-oliva transition-all shrink-0 focus:ring-2 focus:ring-casamento-oliva focus:ring-offset-2 focus:outline-none"
    >
      Copiar
    </button>
  );
}
