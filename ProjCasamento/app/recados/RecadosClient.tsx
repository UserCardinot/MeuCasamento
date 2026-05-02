"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";

export default function RecadosClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [recados, setRecados] = useState<{ nome: string; mensagem: string; data: string }[]>([]);
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  const carregar = useCallback(() => {
    if (!token) return;
    fetch(`/api/listar-recados?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.erro) setErro(data.erro);
        else setRecados(data.recados || []);
      })
      .catch(() => setErro("Erro ao carregar recados."))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const msg = mensagem.trim();
    if (!msg || msg.length > 500) {
      setErro("Mensagem obrigatória (máx. 500 caracteres).");
      return;
    }
    setErro("");
    setEnviando(true);
    try {
      const res = await fetch("/api/enviar-recado", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, mensagem: msg }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.erro || "Erro ao enviar.");
        return;
      }
      setMensagem("");
      carregar();
    } catch {
      setErro("Erro de conexão.");
    } finally {
      setEnviando(false);
    }
  }

  if (!token) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 py-24 bg-[#FAFAFA]">
        <p className="text-stone-600">Acesse através do link do seu convite.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 sm:px-12 lg:px-24 py-20 bg-[#FAFAFA]">
      <div className="max-w-2xl mx-auto">
        <p className="font-sans text-stone-400 text-xs uppercase tracking-widest mb-2">Mural</p>
        <h1 className="font-heading text-3xl sm:text-4xl font-light text-stone-900 mb-4">Recados</h1>
        <p className="font-sans text-stone-600 mb-12">Deixe uma mensagem para Lucas e Beatriz!</p>

        <form onSubmit={handleSubmit} className="mb-16 bg-white rounded-2xl shadow-sm p-8">
          <label className="block font-sans text-sm font-medium text-stone-700 mb-3">Sua mensagem</label>
          <textarea
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            placeholder="Escreva sua mensagem..."
            rows={4}
            maxLength={500}
            className="w-full px-5 py-4 border border-stone-200 rounded-2xl bg-white focus:ring-2 focus:ring-casamento-oliva focus:border-transparent placeholder:text-stone-400 transition-all resize-none"
          />
          <p className="font-sans text-stone-400 text-sm mt-2">{mensagem.length}/500</p>
          {erro && <p className="font-sans text-red-600 text-sm mt-3">{erro}</p>}
          <button
            type="submit"
            disabled={enviando || !mensagem.trim()}
            className="mt-6 w-full py-4 bg-casamento-oliva-escuro text-white font-sans font-medium rounded-2xl hover:bg-casamento-oliva disabled:opacity-50 transition-all duration-200 shadow-sm focus:ring-2 focus:ring-casamento-oliva focus:ring-offset-2 focus:outline-none"
          >
            {enviando ? "Enviando..." : "Enviar recado"}
          </button>
        </form>

        <p className="font-sans text-stone-400 text-xs uppercase tracking-widest mb-6">Recados enviados</p>
        {loading ? (
          <p className="font-sans text-stone-500">Carregando...</p>
        ) : recados.length === 0 ? (
          <p className="font-sans text-stone-500 bg-white rounded-2xl shadow-sm p-12 text-center">Nenhum recado ainda. Seja o primeiro!</p>
        ) : (
          <div className="space-y-6">
            {recados.map((r, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-2xl shadow-sm border border-stone-50"
              >
                <p className="font-sans font-medium text-stone-800">{r.nome}</p>
                <p className="font-sans text-stone-600 mt-2 leading-relaxed">{r.mensagem}</p>
                <p className="font-sans text-stone-400 text-xs mt-4">{r.data}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
