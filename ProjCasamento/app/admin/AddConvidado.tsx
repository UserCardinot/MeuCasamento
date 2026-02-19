"use client";

import { useState } from "react";

type Props = { onAdicionado: () => void };

export default function AddConvidado({ onAdicionado }: Props) {
  const [nome, setNome] = useState("");
  const [acompanhantes, setAcompanhantes] = useState("");
  const [contato, setContato] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) return;
    setErro("");
    setSucesso(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/adicionar-convidado", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nome.trim(),
          acompanhantes: acompanhantes.trim(),
          contato: contato.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.erro || "Erro ao adicionar.");
        return;
      }

      setSucesso(data.link);
      setNome("");
      setAcompanhantes("");
      setContato("");
      onAdicionado();
    } catch {
      setErro("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-white p-6 rounded-lg border border-casamento-sage">
      <h2 className="text-lg font-semibold text-stone-800 mb-4">Adicionar convidado</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Nome *</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-casamento-verde focus:border-casamento-verde"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Acompanhantes</label>
          <input
            type="text"
            value={acompanhantes}
            onChange={(e) => setAcompanhantes(e.target.value)}
            placeholder="Ex: Maria, João"
            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-casamento-verde focus:border-casamento-verde"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Contato (WhatsApp/e-mail)</label>
          <input
            type="text"
            value={contato}
            onChange={(e) => setContato(e.target.value)}
            placeholder="Ex: (11) 99999-9999"
            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-casamento-verde focus:border-casamento-verde"
          />
        </div>
        {erro && <p className="text-red-600 text-sm">{erro}</p>}
        {sucesso && (
          <div className="flex items-center gap-2 p-3 bg-casamento-sage rounded-lg">
            <span className="text-casamento-verde font-medium">✓ Link gerado!</span>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(sucesso)}
              className="text-sm text-casamento-verde hover:underline"
            >
              Copiar
            </button>
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-casamento-verde text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Adicionando..." : "Adicionar"}
        </button>
      </form>
    </section>
  );
}
