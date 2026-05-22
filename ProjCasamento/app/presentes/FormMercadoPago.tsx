"use client";

import { useEffect, useMemo, useState } from "react";
import {
  calcularResumoTaxaCartao,
  formatPrecoBRL,
} from "@/lib/presentes-checkout";
import { presentesBtnPrimary } from "./presentesTheme";

type Props = {
  token: string;
  presentesNomes: string[];
  totalSugerido: number | null;
};

export default function FormMercadoPago({ token, presentesNomes, totalSugerido }: Props) {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [taxaPercent, setTaxaPercent] = useState(5);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/mercadopago/modo")
      .then((r) => r.json())
      .then((data: { taxa_cartao_percent?: number }) => {
        if (!cancelled && typeof data.taxa_cartao_percent === "number") {
          setTaxaPercent(data.taxa_cartao_percent);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const resumo = useMemo(() => {
    if (totalSugerido == null || totalSugerido <= 0) return null;
    return calcularResumoTaxaCartao(totalSugerido, taxaPercent);
  }, [totalSugerido, taxaPercent]);

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
      {resumo && (
        <div className="rounded-sm border border-invite-olive/20 bg-white/60 px-4 py-3 font-sans text-sm text-invite-olive">
          <p className="font-invite-caps text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-invite-olive/75">
            Total no cartão (Mercado Pago)
          </p>
          <ul className="mt-2 space-y-1">
            <li className="flex justify-between gap-4">
              <span className="text-invite-olive/80">Presente(s)</span>
              <span className="tabular-nums font-medium">R$ {formatPrecoBRL(resumo.subtotal)}</span>
            </li>
            {resumo.taxa > 0 && (
              <li className="flex justify-between gap-4">
                <span className="text-invite-olive/80">
                  Taxa do cartão ({resumo.taxaPercent.toString().replace(".", ",")}%)
                </span>
                <span className="tabular-nums font-medium">R$ {formatPrecoBRL(resumo.taxa)}</span>
              </li>
            )}
          </ul>
          <p className="mt-3 flex justify-between gap-4 border-t border-invite-olive/15 pt-2 font-semibold">
            <span>Você pagará</span>
            <span className="tabular-nums">R$ {formatPrecoBRL(resumo.total)}</span>
          </p>
          {resumo.taxa > 0 && (
            <p className="mt-2 text-xs leading-relaxed text-invite-olive/65">
              O valor do presente na lista é R$ {formatPrecoBRL(resumo.subtotal)}. No cartão incluímos a
              tarifa estimada do Mercado Pago para os noivos receberem esse valor.
            </p>
          )}
        </div>
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
