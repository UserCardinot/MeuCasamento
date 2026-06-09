"use client";

import { useEffect, useMemo, useState } from "react";
import { contarPessoasNoConvite } from "@/lib/contagemConvidados";

type Convidado = {
  token: string;
  nome: string;
  acompanhantes: string;
  contato: string;
  origem: string;
};

type Presenca = {
  token: string;
  confirmado: string;
  data: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  convidados: Convidado[];
  presencas: Presenca[];
};

type FiltroPendencia = "sem_resposta" | "nao_ira";

function presencaRecusada(confirmado: string): boolean {
  const conf = String(confirmado)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return conf.includes("nao") && !conf.includes("sim");
}

const THEAD_ROW =
  "border-b border-zinc-100 bg-zinc-50/95 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500";

export default function PendenciasPresencaModal({ open, onClose, convidados, presencas }: Props) {
  const [filtro, setFiltro] = useState<FiltroPendencia>("sem_resposta");
  const [busca, setBusca] = useState("");

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const presencaPorToken = useMemo(() => {
    const map = new Map<string, Presenca>();
    for (const p of presencas) {
      map.set(String(p.token ?? "").toLowerCase(), p);
    }
    return map;
  }, [presencas]);

  const semResposta = useMemo(
    () => convidados.filter((c) => !presencaPorToken.has(c.token.toLowerCase())),
    [convidados, presencaPorToken]
  );

  const naoIrao = useMemo(
    () =>
      convidados
        .map((c) => {
          const p = presencaPorToken.get(c.token.toLowerCase());
          if (!p || !presencaRecusada(p.confirmado)) return null;
          return { convidado: c, data: p.data };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null),
    [convidados, presencaPorToken]
  );

  const listaFiltrada = useMemo(() => {
    const q = busca.trim().toLowerCase();
    const matchBusca = (c: Convidado) =>
      !q ||
      c.nome.toLowerCase().includes(q) ||
      c.acompanhantes.toLowerCase().includes(q) ||
      (c.origem || "").toLowerCase().includes(q) ||
      (c.contato || "").toLowerCase().includes(q);

    if (filtro === "sem_resposta") {
      return semResposta.filter(matchBusca).map((c) => ({ convidado: c, data: undefined as string | undefined }));
    }
    return naoIrao.filter(({ convidado: c }) => matchBusca(c));
  }, [busca, filtro, naoIrao, semResposta]);

  const totalPessoas = useMemo(
    () => listaFiltrada.reduce((sum, { convidado }) => sum + contarPessoasNoConvite(convidado.nome, convidado.acompanhantes), 0),
    [listaFiltrada]
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pendencias-presenca-titulo"
    >
      <button type="button" className="absolute inset-0 bg-zinc-950/50 backdrop-blur-sm" aria-label="Fechar" onClick={onClose} />
      <div className="relative z-10 flex max-h-[min(90vh,720px)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl">
        <div className="border-b border-zinc-100 px-5 py-4 sm:px-6">
          <h2 id="pendencias-presenca-titulo" className="font-heading text-lg font-semibold text-zinc-900">
            Pendências de presença
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Convidados que ainda não responderam ou que informaram que não irão.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <select
              value={filtro}
              onChange={(e) => setFiltro(e.target.value as FiltroPendencia)}
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-casamento-sage focus:outline-none focus:ring-2 focus:ring-casamento-pastel/50"
            >
              <option value="sem_resposta">Sem resposta ({semResposta.length})</option>
              <option value="nao_ira">Não irão ({naoIrao.length})</option>
            </select>
            <input
              type="search"
              placeholder="Buscar por nome, grupo ou contato…"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="min-w-[220px] flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-casamento-sage focus:outline-none focus:ring-2 focus:ring-casamento-pastel/50"
            />
            <p className="text-sm text-zinc-600">
              <strong className="tabular-nums text-zinc-900">{listaFiltrada.length}</strong> convites ·{" "}
              <strong className="tabular-nums text-zinc-900">{totalPessoas}</strong> pessoas
            </p>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto">
          {listaFiltrada.length === 0 ? (
            <p className="px-6 py-12 text-center text-sm text-zinc-500">
              {filtro === "sem_resposta" ? "Todos os convidados já responderam." : "Ninguém informou que não irá."}
            </p>
          ) : (
            <table className="w-full min-w-[640px] text-sm leading-relaxed">
              <thead className="sticky top-0 z-10">
                <tr className={THEAD_ROW}>
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">Grupo</th>
                  <th className="px-4 py-3">Acompanhantes</th>
                  <th className="px-4 py-3 text-center">Pessoas</th>
                  <th className="px-4 py-3">Contato</th>
                  {filtro === "nao_ira" ? <th className="px-4 py-3">Respondido em</th> : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {listaFiltrada.map(({ convidado: c, data }) => (
                  <tr key={c.token} className="transition hover:bg-zinc-50/80">
                    <td className="px-4 py-3.5 font-medium text-zinc-900">{c.nome}</td>
                    <td className="px-4 py-3.5 text-zinc-600">
                      {c.origem ? (
                        <span className="inline-flex rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-800">
                          {c.origem}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-3.5 text-zinc-600" title={c.acompanhantes}>
                      {c.acompanhantes || "—"}
                    </td>
                    <td className="px-4 py-3.5 text-center tabular-nums text-zinc-800">
                      {contarPessoasNoConvite(c.nome, c.acompanhantes)}
                    </td>
                    <td className="px-4 py-3.5 text-zinc-600">{c.contato || "—"}</td>
                    {filtro === "nao_ira" ? (
                      <td className="whitespace-nowrap px-4 py-3.5 text-zinc-500">{data || "—"}</td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="border-t border-zinc-100 px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50 sm:w-auto"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
