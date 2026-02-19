"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LISTA_PRESENTES } from "@/lib/presentes";

type Props = { token: string };

export default function FormPix({ token }: Props) {
  const router = useRouter();
  const [presente, setPresente] = useState("");
  const [valor, setValor] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!presente.trim()) {
      setErro("Selecione um presente.");
      return;
    }
    setErro("");
    setLoading(true);

    try {
      const res = await fetch("/api/registrar-pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          presente: presente.trim(),
          valor: valor.trim() ? valor.replace(/\D/g, "") : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.erro || "Erro ao registrar. Tente novamente.");
        return;
      }

      setSucesso(true);
      router.refresh();
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (sucesso) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-6">
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-2">
          Qual presente escolheu? *
        </label>
        <select
          value={presente}
          onChange={(e) => setPresente(e.target.value)}
          required
          className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-casamento-verde focus:border-casamento-verde"
        >
          <option value="">Selecione...</option>
          {LISTA_PRESENTES.map((p) => (
            <option key={p.id} value={p.nome}>
              {p.nome}
              {p.valorSugerido ? ` (R$ ${p.valorSugerido})` : ""}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">
          Valor (opcional)
        </label>
        <input
          type="text"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder="Ex: 150,00"
          className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-casamento-verde focus:border-casamento-verde"
        />
      </div>

      {erro && (
        <div className="space-y-1">
          <p className="text-red-600 text-sm">{erro}</p>
          <p className="text-stone-500 text-xs">Verifique sua conexão e tente novamente.</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-casamento-verde text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50 transition"
      >
        {loading ? "Registrando..." : "Já fiz o Pix"}
      </button>

      <p className="text-stone-500 text-sm">
        Registramos sua contribuição. A conferência do Pix é feita manualmente pelos noivos.
      </p>
    </form>
  );
}
