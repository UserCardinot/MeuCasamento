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
    <main className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-8 bg-gradient-to-b from-casamento-creme to-casamento-sage">
      <div className="text-center max-w-md">
        <h1 className="font-heading text-4xl font-bold text-stone-800">Algo deu errado</h1>
        <p className="mt-4 text-stone-600">
          Ocorreu um erro inesperado. Tente novamente ou volte mais tarde.
        </p>
        <button
          onClick={reset}
          className="mt-8 px-6 py-3 bg-casamento-verde text-white font-medium rounded-lg hover:opacity-90 transition"
        >
          Tentar novamente
        </button>
      </div>
    </main>
  );
}
