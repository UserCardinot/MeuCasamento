"use client";

import { useState } from "react";
import { presentesBtnPrimary } from "./presentesTheme";

type Props = {
  token: string;
  presenteNome: string;
};

export default function FormMercadoPago({ token, presenteNome }: Props) {
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
          presente: presenteNome,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.erro || "Não foi possível abrir o checkout.");
        return;
      }
      const url = data.init_point as string | undefined;
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
