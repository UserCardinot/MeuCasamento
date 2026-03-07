"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 sm:px-12 py-24 bg-[#FAFAFA]">
      <div className="text-center max-w-md space-y-6">
        <h1 className="font-heading text-4xl font-light text-stone-900">Algo deu errado</h1>
        <p className="font-sans text-stone-600">
          Ocorreu um erro inesperado. Tente novamente ou volte mais tarde.
        </p>
        <button
          onClick={reset}
          className="px-8 py-4 bg-casamento-oliva-escuro text-white font-sans font-medium rounded-2xl hover:bg-casamento-oliva transition-all duration-200 shadow-sm focus:ring-2 focus:ring-casamento-oliva focus:ring-offset-2 focus:outline-none"
        >
          Tentar novamente
        </button>
      </div>
    </main>
  );
}
