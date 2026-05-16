"use client";

import { useState } from "react";
import { formatPrecoBRL } from "@/lib/presentes-checkout";
import { presentesBtnPrimary } from "./presentesTheme";

type Props = {
  token: string;
  presentesNomes: string[];
  totalSugerido: number | null;
};

export default function FormMercadoPago({ token, presentesNomes, totalSugerido }: Props) {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function handlePagarCartao() {
    setErro("");
    setLoading(true);
    try {
      const res = await fetch("/api/mercadopago/preferencia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          presentes: presentesNomes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.erro || "Não foi possível abrir o checkout.");
        return;
      }
      const url = data.init_point as string | undefined;
      const host = data.checkout_host as string | undefined;
      if (url && host && !host.includes("sandbox.mercadopago") && data.sandbox === true) {
        setErro(
          "Checkout abriria em produção com modo teste. No Vercel, defina MERCADOPAGO_SANDBOX=true e Access Token de teste."
        );
        return;
      }
      if (url) {
        window.location.href = url;
        return;
      }
      setErro("Resposta inválida do servidor.");
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {totalSugerido != null && (
        <p className="font-invite-caps text-center text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-invite-olive sm:text-left">
          Total no checkout: R$ {formatPrecoBRL(totalSugerido)}
        </p>
      )}
      {erro && (
        <p className="font-sans text-sm text-red-700/90" role="alert">
          {erro}
        </p>
      )}
      <button
        type="button"
        onClick={handlePagarCartao}
        disabled={loading}
        className={presentesBtnPrimary}
      >
        {loading ? "Abrindo checkout..." : "Ir para pagamento com cartão"}
      </button>
    </div>
  );
}
