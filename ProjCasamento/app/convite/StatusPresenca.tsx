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
      <div className="bg-casamento-sage border border-casamento-verde/50 text-stone-800 px-4 py-3 rounded-lg flex items-center justify-center gap-2">
        <span>✓</span>
        <span>Sua presença está confirmada!</span>
      </div>
      <button
        onClick={handleCancelar}
        disabled={loading}
        className="text-sm text-stone-500 hover:text-red-600 underline disabled:opacity-50"
      >
        {loading ? "Cancelando..." : "Cancelar confirmação"}
      </button>
    </div>
  );
}
