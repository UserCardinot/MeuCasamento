"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrecoBRL } from "@/lib/presentes-checkout";
import { presentesBtnPrimary, presentesFieldClass, presentesLabelClass } from "./presentesTheme";

type Props = {
  token: string;
  presentesNomes: string[];
  totalSugerido: number | null;
};

export default function FormPix({ token, presentesNomes, totalSugerido }: Props) {
  const router = useRouter();
  const [valor, setValor] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (totalSugerido != null && totalSugerido > 0) {
      setValor(formatPrecoBRL(totalSugerido));
    }
  }, [totalSugerido]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (totalSugerido != null && !valor.trim()) {
      setErro("Informe o valor que você pagou.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/registrar-pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          presentes: presentesNomes,
          valor: valor.trim()
            ? valor.replace(/\D/g, "")
            : totalSugerido != null
              ? String(Math.round(totalSugerido * 100))
              : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.erro || "Erro ao registrar. Tente novamente.");
        return;
      }

      router.refresh();
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  const valorConhecido = totalSugerido != null && totalSugerido > 0;
  const placeholder = valorConhecido ? `R$ ${formatPrecoBRL(totalSugerido)}` : "Ex.: 150,00";

  return (
    <form onSubmit={handleSubmit} className="space-y-5 border-t border-invite-olive/20 pt-8">
      <p className="font-invite-caps text-[0.68rem] font-medium uppercase tracking-[0.16em] text-invite-olive/80">
        2. Confirme após pagar
      </p>
      <p className="font-sans text-sm leading-relaxed text-invite-olive/75">
        Depois de transferir, clique no botão abaixo para avisar os noivos.
      </p>

      <div>
        <label htmlFor="valor-pix" className={presentesLabelClass}>
          Valor pago{" "}
          {!valorConhecido && (
            <span className="font-sans font-normal normal-case tracking-normal text-invite-olive/55">
              (opcional)
            </span>
          )}
        </label>
        <input
          id="valor-pix"
          type="text"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder={placeholder}
          readOnly={valorConhecido}
          className={`${presentesFieldClass}${valorConhecido ? " bg-invite-cream/60" : ""}`}
        />
      </div>

      {erro && (
        <p className="font-sans text-sm text-red-700/90" role="alert">
          {erro}
        </p>
      )}

      <button type="submit" disabled={loading} className={presentesBtnPrimary}>
        {loading ? "Registrando..." : "Já fiz o Pix"}
      </button>
    </form>
  );
}
