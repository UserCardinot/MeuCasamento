"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = { token: string };

export default function StatusPresenca({ token }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCancelar() {
    if (!confirm("Deseja cancelar sua confirmação de presença?")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/confirmar-presenca", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, confirmado: false }),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm py-6 px-8 flex items-center justify-center gap-3 border border-stone-100">
        <span className="text-casamento-oliva-escuro" aria-hidden>✓</span>
        <span className="font-sans font-medium text-stone-800">Sua presença está confirmada!</span>
      </div>
      <button
        onClick={handleCancelar}
        disabled={loading}
        className="block mx-auto font-sans text-sm text-stone-500 hover:text-red-600 disabled:opacity-50 transition-colors focus:ring-2 focus:ring-red-300 focus:ring-offset-2 rounded"
      >
        {loading ? "Cancelando..." : "Cancelar confirmação"}
      </button>
    </div>
  );
}
