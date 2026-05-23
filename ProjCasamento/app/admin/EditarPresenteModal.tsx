"use client";

import { useEffect, useState } from "react";

type PresenteCatalogo = {
  nomeOriginal: string;
  nome: string;
  preco: string;
  url: string;
  imagem: string;
  ativo: string;
};

type Props = {
  presente: PresenteCatalogo | null;
  onClose: () => void;
  onSalvo: () => void;
};

const inputClass =
  "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm transition-all placeholder:text-zinc-400 focus:border-casamento-sage focus:outline-none focus:ring-2 focus:ring-casamento-pastel/50";

function ativoParaSelect(ativo: string): "sim" | "nao" {
  return ativo.trim().toLowerCase().startsWith("s") ? "sim" : "nao";
}

export default function EditarPresenteModal({ presente, onClose, onSalvo }: Props) {
  const [nome, setNome] = useState("");
  const [preco, setPreco] = useState("");
  const [url, setUrl] = useState("");
  const [imagem, setImagem] = useState("");
  const [ativo, setAtivo] = useState<"sim" | "nao">("sim");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (presente) {
      setNome(presente.nome);
      setPreco(presente.preco);
      setUrl(presente.url);
      setImagem(presente.imagem);
      setAtivo(ativoParaSelect(presente.ativo));
      setErro("");
    }
  }, [presente]);

  useEffect(() => {
    if (!presente) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [presente, onClose]);

  if (!presente) return null;

  const p = presente;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) return;
    setErro("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/editar-presente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nomeOriginal: p.nomeOriginal,
          nome: nome.trim(),
          preco: preco.trim(),
          url: url.trim(),
          imagem: imagem.trim(),
          ativo: ativo === "sim" ? "Sim" : "Não",
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
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="editar-presente-titulo"
    >
      <button
        type="button"
        className="absolute inset-0 bg-zinc-950/50 backdrop-blur-sm"
        aria-label="Fechar"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-zinc-200 bg-white shadow-xl">
        <div className="border-b border-zinc-100 px-5 py-4 sm:px-6">
          <h2 id="editar-presente-titulo" className="font-heading text-lg font-semibold text-zinc-900">
            Editar presente
          </h2>
          <p className="mt-1 text-xs text-zinc-500">Alterações refletem na lista de presentes do convite.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-4 sm:px-6">
          <div>
            <label htmlFor="edit-presente-nome" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Nome <span className="text-red-600">*</span>
            </label>
            <input
              id="edit-presente-nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label htmlFor="edit-presente-preco" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Preço sugerido (R$)
            </label>
            <input
              id="edit-presente-preco"
              type="text"
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
              className={inputClass}
              placeholder="Ex: 150,00"
            />
          </div>
          <div>
            <label htmlFor="edit-presente-url" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
              URL do produto
            </label>
            <input
              id="edit-presente-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className={inputClass}
              placeholder="https://..."
            />
          </div>
          <div>
            <label htmlFor="edit-presente-imagem" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
              URL da imagem
            </label>
            <input
              id="edit-presente-imagem"
              type="url"
              value={imagem}
              onChange={(e) => setImagem(e.target.value)}
              className={inputClass}
              placeholder="https://..."
            />
          </div>
          <div>
            <label htmlFor="edit-presente-ativo" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Exibir no site
            </label>
            <select
              id="edit-presente-ativo"
              value={ativo}
              onChange={(e) => setAtivo(e.target.value as "sim" | "nao")}
              className={inputClass}
            >
              <option value="sim">Sim — visível para convidados</option>
              <option value="nao">Não — oculto da lista</option>
            </select>
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
