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
    <section className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.05)] ring-1 ring-zinc-950/[0.04] sm:p-7">
      <h2 className="mb-1 font-heading text-lg font-semibold tracking-tight text-zinc-900">Adicionar presente ao catálogo</h2>
      <p className="mb-5 text-sm text-zinc-500">O item aparecerá na lista de presentes do site.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">Nome *</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Cafeteira Nespresso"
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 focus:border-casamento-sage focus:ring-2 focus:ring-casamento-pastel/50"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">Preço sugerido (R$)</label>
          <input
            type="text"
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
            placeholder="Ex: 150,00"
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 focus:border-casamento-sage focus:ring-2 focus:ring-casamento-pastel/50"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">URL do produto</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 focus:border-casamento-sage focus:ring-2 focus:ring-casamento-pastel/50"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">URL da imagem</label>
          <input
            type="url"
            value={imagem}
            onChange={(e) => setImagem(e.target.value)}
            placeholder="https://..."
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 focus:border-casamento-sage focus:ring-2 focus:ring-casamento-pastel/50"
          />
        </div>
        {erro && <p className="text-red-600 text-sm">{erro}</p>}
        {sucesso && <p className="text-casamento-oliva-escuro font-medium">✓ Presente adicionado!</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-casamento-oliva-escuro px-6 py-3 font-medium text-white transition-all duration-200 hover:bg-casamento-oliva disabled:opacity-50"
        >
          {loading ? "Adicionando..." : "Adicionar presente"}
        </button>
      </form>
    </section>
  );
}
