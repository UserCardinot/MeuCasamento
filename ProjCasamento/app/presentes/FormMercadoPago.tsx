"use client";

import { useState } from "react";

type Props = {
  token: string;
  presenteNome: string;
  precoCatalogo?: string;
};

export default function FormMercadoPago({ token, presenteNome, precoCatalogo }: Props) {
  const [valor, setValor] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function handlePagarCartao(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);
    try {
      const res = await fetch("/api/mercadopago/preferencia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          presente: presenteNome,
          ...(valor.trim() ? { valor: valor.trim() } : {}),
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
    <form onSubmit={handlePagarCartao} className="space-y-4 mt-8 pt-8 border-t border-stone-100">
      <p className="font-sans text-stone-400 text-xs uppercase tracking-widest">Cartão de crédito</p>
      <p className="text-stone-600 text-sm">
        Pague com cartão pelo Mercado Pago. O registro na lista ocorre automaticamente após a aprovação do
        pagamento.
      </p>
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">
          Valor opcional (se quiser pagar mais que o preço sugerido)
        </label>
        <input
          type="text"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder={precoCatalogo ? `Padrão: R$ ${precoCatalogo.replace(".", ",")}` : "Ex: 200,00"}
          className="w-full px-4 py-3 border border-stone-200 rounded-2xl bg-white focus:ring-2 focus:ring-casamento-oliva focus:border-transparent placeholder:text-stone-400 transition-all"
        />
      </div>
      {erro && <p className="text-red-600 text-sm">{erro}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-stone-900 text-white font-sans font-medium rounded-2xl hover:bg-stone-800 active:scale-[0.98] disabled:opacity-50 transition shadow-sm focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 focus:outline-none"
      >
        {loading ? "Abrindo checkout..." : "Pagar com cartão (Mercado Pago)"}
      </button>
    </form>
  );
}
