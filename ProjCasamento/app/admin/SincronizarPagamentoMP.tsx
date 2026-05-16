"use client";

import { useState } from "react";

type Props = {
  onSincronizado: () => void;
};

export default function SincronizarPagamentoMP({ onSincronizado }: Props) {
  const [paymentId, setPaymentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const id = paymentId.trim();
    if (!id) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/sincronizar-pagamento-mp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_id: id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg({ tipo: "erro", texto: data.erro || "Não foi possível registrar." });
        return;
      }
      setMsg({
        tipo: "ok",
        texto: data.jaRegistrado
          ? "Esse pagamento já estava na planilha."
          : "Pagamento registrado no histórico.",
      });
      setPaymentId("");
      onSincronizado();
    } catch {
      setMsg({ tipo: "erro", texto: "Erro de conexão." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/80 p-4"
    >
      <p className="text-sm font-medium text-zinc-800">Registrar pagamento do Mercado Pago</p>
      <p className="mt-1 text-xs leading-relaxed text-zinc-500">
        Se o dinheiro caiu mas o histórico ficou vazio, cole o <strong>número do pagamento</strong> (em Atividade →
        detalhe da venda no app Mercado Pago).
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="text"
          inputMode="numeric"
          placeholder="Ex.: 12345678901234"
          value={paymentId}
          onChange={(e) => setPaymentId(e.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-casamento-sage focus:outline-none focus:ring-2 focus:ring-casamento-pastel/50"
        />
        <button
          type="submit"
          disabled={loading || !paymentId.trim()}
          className="rounded-lg bg-casamento-oliva-escuro px-4 py-2 text-sm font-medium text-white transition hover:bg-casamento-oliva disabled:opacity-50"
        >
          {loading ? "Registrando…" : "Registrar na planilha"}
        </button>
      </div>
      {msg && (
        <p
          className={`mt-2 text-sm ${msg.tipo === "ok" ? "text-emerald-700" : "text-red-700"}`}
          role="status"
        >
          {msg.texto}
        </p>
      )}
    </form>
  );
}
