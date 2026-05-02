"use client";

import { useEffect, useId, useState } from "react";
import { ORIGEM_CONVIDADO_SUGESTOES } from "@/lib/origemConvidado";

type Convidado = {
  token: string;
  nome: string;
  acompanhantes: string;
  contato: string;
  origem: string;
};

type Props = {
  convidado: Convidado | null;
  onClose: () => void;
  onSalvo: () => void;
};

const inputClass =
  "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm transition-all placeholder:text-zinc-400 focus:border-casamento-sage focus:outline-none focus:ring-2 focus:ring-casamento-pastel/50";

export default function EditarConvidadoModal({ convidado, onClose, onSalvo }: Props) {
  const origemListId = useId();
  const [nome, setNome] = useState("");
  const [acompanhantes, setAcompanhantes] = useState("");
  const [contato, setContato] = useState("");
  const [origem, setOrigem] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (convidado) {
      setNome(convidado.nome);
      setAcompanhantes(convidado.acompanhantes);
      setContato(convidado.contato);
      setOrigem(convidado.origem);
      setErro("");
    }
  }, [convidado]);

  useEffect(() => {
    if (!convidado) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [convidado, onClose]);

  if (!convidado) return null;

  const c = convidado;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) return;
    setErro("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/editar-convidado", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: c.token,
          nome: nome.trim(),
          acompanhantes: acompanhantes.trim(),
          contato: contato.trim(),
          origem: origem.trim(),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { erro?: string };
      if (res.status === 401) {
        window.location.reload();
        return;
      }
      if (!res.ok) {
        setErro(data.erro || "Erro ao salvar.");
        return;
      }
      onSalvo();
      onClose();
    } catch {
      setErro("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="editar-convidado-titulo">
      <button
        type="button"
        className="absolute inset-0 bg-zinc-950/50 backdrop-blur-sm"
        aria-label="Fechar"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-zinc-200 bg-white shadow-xl">
        <div className="border-b border-zinc-100 px-5 py-4 sm:px-6">
          <h2 id="editar-convidado-titulo" className="font-heading text-lg font-semibold text-zinc-900">
            Editar convidado
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            O link do convite não muda (token fixo). Ajuste nome, acompanhantes, contato e origem.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-4 sm:px-6">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">Token (somente leitura)</label>
            <p className="rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2 font-mono text-xs text-zinc-600">{c.token}</p>
          </div>
          <div>
            <label htmlFor="edit-nome" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Nome <span className="text-red-600">*</span>
            </label>
            <input id="edit-nome" type="text" value={nome} onChange={(e) => setNome(e.target.value)} className={inputClass} required />
          </div>
          <div>
            <label htmlFor="edit-acomp" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Acompanhantes
            </label>
            <input
              id="edit-acomp"
              type="text"
              value={acompanhantes}
              onChange={(e) => setAcompanhantes(e.target.value)}
              className={inputClass}
            />
            <p className="mt-1.5 text-xs text-zinc-400">
              Vários nomes: separe por vírgula (ex.: Maria, Pedro, Tiago). Conta no total de pessoas do convite.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="edit-contato" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Contato
              </label>
              <input id="edit-contato" type="text" value={contato} onChange={(e) => setContato(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label htmlFor="edit-origem" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Grupo / origem
              </label>
              <input
                id="edit-origem"
                type="text"
                value={origem}
                onChange={(e) => setOrigem(e.target.value)}
                className={inputClass}
                list={origemListId}
              />
              <datalist id={origemListId}>
                {ORIGEM_CONVIDADO_SUGESTOES.map((o) => (
                  <option key={o} value={o} />
                ))}
              </datalist>
            </div>
          </div>
          {erro && <p className="text-sm text-red-600">{erro}</p>}
          <div className="flex flex-col-reverse gap-2 border-t border-zinc-100 pt-4 sm:flex-row sm:justify-end sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-casamento-oliva-escuro px-4 py-2.5 text-sm font-semibold text-white hover:bg-casamento-oliva disabled:opacity-50"
            >
              {loading ? "Salvando…" : "Salvar alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
