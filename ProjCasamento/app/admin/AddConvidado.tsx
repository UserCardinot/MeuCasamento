"use client";

import { useId, useState } from "react";
import { buildConviteWhatsAppUrl } from "@/lib/convite-whatsapp";
import { ORIGEM_CONVIDADO_SUGESTOES } from "@/lib/origemConvidado";

type Props = { onAdicionado: () => void };

const inputClass =
  "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm transition-all placeholder:text-zinc-400 focus:border-casamento-sage focus:outline-none focus:ring-2 focus:ring-casamento-pastel/50";

export default function AddConvidado({ onAdicionado }: Props) {
  const origemListId = useId();
  const [nome, setNome] = useState("");
  const [acompanhantes, setAcompanhantes] = useState("");
  const [contato, setContato] = useState("");
  const [origem, setOrigem] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [ultimoConvite, setUltimoConvite] = useState<{ link: string; nome: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) return;
    setErro("");
    setUltimoConvite(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/adicionar-convidado", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nome.trim(),
          acompanhantes: acompanhantes.trim(),
          contato: contato.trim(),
          origem: origem.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.erro || "Erro ao adicionar.");
        return;
      }

      setUltimoConvite({ link: data.link, nome: nome.trim() });
      setNome("");
      setAcompanhantes("");
      setContato("");
      setOrigem("");
      onAdicionado();
    } catch {
      setErro("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-zinc-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] ring-1 ring-zinc-950/[0.04]">
      <div className="border-b border-zinc-100 bg-zinc-50/80 px-5 py-4 sm:px-6 sm:py-4">
        <h2 className="font-heading text-lg font-semibold tracking-tight text-zinc-900">Cadastro individual</h2>
        <p className="mt-1 text-sm text-zinc-500">Um convidado por vez — gera o link único na hora.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-5 sm:p-6">
        <div className="grid gap-4 sm:gap-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="min-w-0">
              <label htmlFor="conv-nome" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Nome completo <span className="text-red-600">*</span>
              </label>
              <input
                id="conv-nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Maria Souza"
                className={inputClass}
                required
                autoComplete="name"
              />
            </div>
            <div className="min-w-0">
              <label htmlFor="conv-acomp" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Acompanhantes
              </label>
              <input
                id="conv-acomp"
                type="text"
                value={acompanhantes}
                onChange={(e) => setAcompanhantes(e.target.value)}
                placeholder="Ex: João Souza, Ana Lima"
                className={inputClass}
              />
              <p className="mt-1.5 text-xs text-zinc-400">
                Vários nomes: separe por vírgula (ex.: Maria, Pedro, Tiago). Conta no total de pessoas do convite.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="conv-contato" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Contato (WhatsApp ou e-mail)
              </label>
              <input
                id="conv-contato"
                type="text"
                value={contato}
                onChange={(e) => setContato(e.target.value)}
                placeholder="Ex: (11) 99999-9999 ou email@exemplo.com"
                className={inputClass}
                inputMode="tel"
              />
            </div>
            <div>
              <label htmlFor="conv-origem" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Grupo / origem
              </label>
              <input
                id="conv-origem"
                type="text"
                value={origem}
                onChange={(e) => setOrigem(e.target.value)}
                placeholder="Ex: Amigos do noivo, Igreja…"
                className={inputClass}
                list={origemListId}
              />
              <datalist id={origemListId}>
                {ORIGEM_CONVIDADO_SUGESTOES.map((o) => (
                  <option key={o} value={o} />
                ))}
              </datalist>
              <p className="mt-1.5 text-xs text-zinc-400">Facilita organizar a lista (opcional).</p>
            </div>
          </div>
        </div>

        {erro && <p className="mt-4 text-sm text-red-600">{erro}</p>}
        {ultimoConvite && (
          <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-emerald-200/80 bg-emerald-50/60 px-3 py-2.5 text-sm">
            <span className="font-medium text-emerald-900">Link gerado.</span>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(ultimoConvite.link)}
              className="font-medium text-casamento-oliva-escuro underline-offset-2 hover:underline"
            >
              Copiar link
            </button>
            <a
              href={buildConviteWhatsAppUrl(ultimoConvite.link, ultimoConvite.nome)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-casamento-oliva-escuro underline-offset-2 hover:underline"
            >
              WhatsApp
            </a>
          </div>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-zinc-100 pt-5 sm:flex-row sm:items-center sm:justify-end">
          <p className="text-center text-xs text-zinc-400 sm:mr-auto sm:text-left">Campos com * são obrigatórios.</p>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-casamento-oliva-escuro px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-casamento-oliva disabled:opacity-50 sm:w-auto"
          >
            {loading ? "Gerando link…" : "Gerar convite"}
          </button>
        </div>
      </form>
    </section>
  );
}
