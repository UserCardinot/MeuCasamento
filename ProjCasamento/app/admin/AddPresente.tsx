"use client";

import { useState } from "react";

type Props = { onAdicionado: () => void };

export default function AddPresente({ onAdicionado }: Props) {
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [url, setUrl] = useState("");
  const [imagem, setImagem] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) {
      setErro("Nome obrigatório.");
      return;
    }
    setErro("");
    setSucesso(false);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/adicionar-presente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nome.trim(),
          preco: preco.trim(),
          url: url.trim(),
          imagem: imagem.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.erro || "Erro ao adicionar.");
        return;
      }

      setSucesso(true);
      setNome("");
      setPreco("");
      setUrl("");
      setImagem("");
      onAdicionado();
    } catch {
      setErro("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 mt-6">
      <h2 className="text-lg font-semibold text-stone-800 mb-4">Adicionar presente ao catálogo</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Nome *</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Cafeteira Nespresso"
            className="w-full px-3 py-2 border border-stone-300 rounded-2xl bg-white border border-stone-200 focus:ring-2 focus:ring-casamento-oliva focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Preço sugerido (R$)</label>
          <input
            type="text"
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
            placeholder="Ex: 150,00"
            className="w-full px-3 py-2 border border-stone-300 rounded-2xl bg-white border border-stone-200 focus:ring-2 focus:ring-casamento-oliva focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">URL do produto</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            className="w-full px-3 py-2 border border-stone-300 rounded-2xl bg-white border border-stone-200 focus:ring-2 focus:ring-casamento-oliva focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">URL da imagem</label>
          <input
            type="url"
            value={imagem}
            onChange={(e) => setImagem(e.target.value)}
            placeholder="https://..."
            className="w-full px-3 py-2 border border-stone-300 rounded-2xl bg-white border border-stone-200 focus:ring-2 focus:ring-casamento-oliva focus:border-transparent"
          />
        </div>
        {erro && <p className="text-red-600 text-sm">{erro}</p>}
        {sucesso && <p className="text-casamento-oliva-escuro font-medium">✓ Presente adicionado!</p>}
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-casamento-oliva-escuro text-white font-sans font-medium rounded-2xl hover:bg-casamento-oliva transition-all duration-200 disabled:opacity-50"
        >
          {loading ? "Adicionando..." : "Adicionar presente"}
        </button>
      </form>
    </section>
  );
}
