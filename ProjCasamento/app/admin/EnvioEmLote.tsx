"use client";

import { useState } from "react";

type Props = { onAdicionados: () => void };

export default function EnvioEmLote({ onAdicionados }: Props) {
  const [texto, setTexto] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState<number | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const linhas = texto
      .trim()
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (linhas.length === 0) {
      setErro("Cole pelo menos uma linha (nome ou nome;acompanhantes;contato).");
      return;
    }
    setErro("");
    setSucesso(null);
    setLoading(true);

    let adicionados = 0;
    for (const linha of linhas) {
      const [nome, acompanhantes, contato] = linha.split(";").map((s) => s.trim());
      if (!nome) continue;
      try {
        const res = await fetch("/api/admin/adicionar-convidado", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nome,
            acompanhantes: acompanhantes || "",
            contato: contato || "",
          }),
        });
        if (res.ok) adicionados++;
      } catch {
        break;
      }
    }

    setSucesso(adicionados);
    setTexto("");
    onAdicionados();
    setLoading(false);
  }

  return (
    <section className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 mt-6">
      <h2 className="text-lg font-semibold text-stone-800 mb-4">Envio em lote</h2>
      <p className="text-sm text-stone-600 mb-2">
        Cole um convidado por linha. Formato: <code className="bg-stone-100 px-1 rounded">nome</code> ou{" "}
        <code className="bg-stone-100 px-1 rounded">nome;acompanhantes;contato</code>
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder={"Maria Silva\nJoão;Ana e Pedro;(11) 99999-9999"}
          rows={6}
          className="w-full px-5 py-4 border border-stone-200 rounded-2xl bg-white focus:ring-2 focus:ring-casamento-oliva focus:border-transparent text-sm font-mono transition-all"
        />
        {erro && <p className="text-red-600 text-sm">{erro}</p>}
        {sucesso !== null && (
          <p className="text-casamento-oliva-escuro font-medium">✓ {sucesso} convidado(s) adicionado(s).</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-casamento-oliva-escuro text-white font-sans font-medium rounded-2xl hover:bg-casamento-oliva transition-all duration-200 disabled:opacity-50"
        >
          {loading ? "Adicionando..." : "Adicionar em lote"}
        </button>
      </form>
    </section>
  );
}
