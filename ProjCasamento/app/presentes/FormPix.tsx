"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Presente = { nome: string; preco: string; url: string; imagem: string };

type Props = {
  token: string;
  catalog: Presente[];
  presentePreselecionado?: string;
};

export default function FormPix({ token, catalog, presentePreselecionado }: Props) {
  const router = useRouter();
  const [presente, setPresente] = useState(presentePreselecionado || "");
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
        <label className="block text-sm font-medium text-stone-700 mb-1.5">
          Qual presente escolheu? *
        </label>
        <select
          value={presente}
          onChange={(e) => setPresente(e.target.value)}
          required
          className="w-full px-5 py-4 border border-stone-200 rounded-2xl bg-white focus:ring-2 focus:ring-casamento-oliva focus:border-transparent transition-all"
        >
          <option value="">Selecione...</option>
          {catalog.map((p, i) => (
            <option key={i} value={p.nome}>
              {p.nome}
              {p.preco ? ` (R$ ${p.preco.replace(".", ",")})` : ""}
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
          className="w-full px-4 py-3 border border-stone-300 rounded-2xl bg-white border border-stone-200 focus:ring-2 focus:ring-casamento-oliva focus:border-transparent placeholder:text-stone-400 transition-all placeholder:text-stone-400"
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
        className="w-full py-3 bg-casamento-oliva-escuro text-white font-sans font-medium rounded-2xl hover:bg-casamento-oliva active:scale-[0.98] disabled:opacity-50 transition shadow-sm focus:ring-2 focus:ring-casamento-oliva focus:ring-offset-2 focus:outline-none"
      >
        {loading ? "Registrando..." : "Já fiz o Pix"}
      </button>

      <p className="text-stone-500 text-sm">
        Registramos sua contribuição. A conferência do Pix é feita manualmente pelos noivos.
      </p>
    </form>
  );
}
