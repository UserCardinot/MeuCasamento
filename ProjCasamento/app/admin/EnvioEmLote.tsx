"use client";

import { useCallback, useId, useState } from "react";
import { ORIGEM_CONVIDADO_SUGESTOES } from "@/lib/origemConvidado";

type Props = { onAdicionados: () => void };

type Linha = { id: string; nome: string; acompanhantes: string; contato: string; origem: string };

function novaLinha(): Linha {
  return {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
    nome: "",
    acompanhantes: "",
    contato: "",
    origem: "",
  };
}

const cellInput =
  "w-full min-w-0 rounded-md border border-zinc-200 bg-white px-2.5 py-2 text-sm placeholder:text-zinc-400 focus:border-casamento-sage focus:outline-none focus:ring-1 focus:ring-casamento-pastel/60";

export default function EnvioEmLote({ onAdicionados }: Props) {
  const baseId = useId();
  const origemDatalistId = useId();
  const [linhas, setLinhas] = useState<Linha[]>(() => [novaLinha(), novaLinha(), novaLinha()]);
  const [importAberto, setImportAberto] = useState(false);
  const [textoImport, setTextoImport] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState<number | null>(null);

  const atualizar = useCallback((id: string, campo: keyof Omit<Linha, "id">, valor: string) => {
    setLinhas((prev) => prev.map((l) => (l.id === id ? { ...l, [campo]: valor } : l)));
  }, []);

  const removerLinha = useCallback((id: string) => {
    setLinhas((prev) => {
      if (prev.length <= 1) {
        const only = prev[0];
        return [{ ...only, nome: "", acompanhantes: "", contato: "", origem: "" }];
      }
      return prev.filter((l) => l.id !== id);
    });
  }, []);

  const adicionarLinha = useCallback(() => {
    setLinhas((prev) => [...prev, novaLinha()]);
  }, []);

  /** Cola do Excel/Sheets (tab), CSV (; ou ,) ou uma coluna por linha. */
  const aplicarImport = useCallback(() => {
    const raw = textoImport.trim();
    if (!raw) {
      setErro("Cole os dados no campo acima.");
      return;
    }
    const linhasTexto = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const novas: Linha[] = linhasTexto.map((linha) => {
      let parts: string[];
      if (linha.includes("\t")) {
        parts = linha.split("\t").map((s) => s.trim());
      } else if (linha.includes(";")) {
        parts = linha.split(";").map((s) => s.trim());
      } else {
        parts = [linha, "", "", ""];
      }
      const row = novaLinha();
      return {
        ...row,
        nome: parts[0] ?? "",
        acompanhantes: parts[1] ?? "",
        contato: parts[2] ?? "",
        origem: parts[3] ?? "",
      };
    });
    if (novas.length === 0) {
      setErro("Nenhuma linha válida.");
      return;
    }
    setLinhas(novas);
    setTextoImport("");
    setImportAberto(false);
    setErro("");
  }, [textoImport]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const preenchidas = linhas.filter((l) => l.nome.trim());
    if (preenchidas.length === 0) {
      setErro("Preencha o nome em pelo menos uma linha.");
      return;
    }
    setErro("");
    setSucesso(null);
    setLoading(true);

    let adicionados = 0;
    for (const l of preenchidas) {
      try {
        const res = await fetch("/api/admin/adicionar-convidado", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nome: l.nome.trim(),
            acompanhantes: l.acompanhantes.trim(),
            contato: l.contato.trim(),
            origem: l.origem.trim(),
          }),
        });
        if (res.ok) adicionados++;
      } catch {
        break;
      }
    }

    setSucesso(adicionados);
    setLinhas([novaLinha(), novaLinha(), novaLinha()]);
    onAdicionados();
    setLoading(false);
  }

  return (
    <section className="rounded-2xl border border-zinc-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)] ring-1 ring-zinc-950/[0.04]">
      <div className="border-b border-zinc-100 bg-zinc-50/80 px-5 py-4 sm:px-6">
        <h2 className="font-heading text-lg font-semibold tracking-tight text-zinc-900">Cadastro em lote</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Uma linha por convidado: nome (obrigatório), acompanhantes (vários nomes separados por vírgula), contato e grupo/origem (opcionais).
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-5 sm:p-6">
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50/40">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-100/80">
                  <th className="whitespace-nowrap px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-zinc-600">
                    Nome <span className="text-red-500">*</span>
                  </th>
                  <th className="whitespace-nowrap px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-zinc-600">Acompanhantes</th>
                  <th className="whitespace-nowrap px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-zinc-600">Contato</th>
                  <th className="min-w-[8rem] whitespace-nowrap px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-zinc-600">
                    Grupo / origem
                  </th>
                  <th className="w-10 px-1 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-zinc-500" aria-label="Remover linha">
                    {""}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 bg-white">
                {linhas.map((l, idx) => (
                  <tr key={l.id} className="hover:bg-zinc-50/50">
                    <td className="px-2 py-1.5 align-middle">
                      <label className="sr-only" htmlFor={`${baseId}-nome-${idx}`}>
                        Nome linha {idx + 1}
                      </label>
                      <input
                        id={`${baseId}-nome-${idx}`}
                        type="text"
                        value={l.nome}
                        onChange={(e) => atualizar(l.id, "nome", e.target.value)}
                        placeholder="Nome"
                        className={cellInput}
                        autoComplete="off"
                      />
                    </td>
                    <td className="px-2 py-1.5 align-middle">
                      <label className="sr-only" htmlFor={`${baseId}-acomp-${idx}`}>
                        Acompanhantes linha {idx + 1}
                      </label>
                      <input
                        id={`${baseId}-acomp-${idx}`}
                        type="text"
                        value={l.acompanhantes}
                        onChange={(e) => atualizar(l.id, "acompanhantes", e.target.value)}
                        placeholder="Opcional"
                        className={cellInput}
                      />
                    </td>
                    <td className="px-2 py-1.5 align-middle">
                      <label className="sr-only" htmlFor={`${baseId}-cont-${idx}`}>
                        Contato linha {idx + 1}
                      </label>
                      <input
                        id={`${baseId}-cont-${idx}`}
                        type="text"
                        value={l.contato}
                        onChange={(e) => atualizar(l.id, "contato", e.target.value)}
                        placeholder="Opcional"
                        className={cellInput}
                      />
                    </td>
                    <td className="px-2 py-1.5 align-middle">
                      <label className="sr-only" htmlFor={`${baseId}-origem-${idx}`}>
                        Grupo ou origem linha {idx + 1}
                      </label>
                      <input
                        id={`${baseId}-origem-${idx}`}
                        type="text"
                        value={l.origem}
                        onChange={(e) => atualizar(l.id, "origem", e.target.value)}
                        placeholder="Opcional"
                        className={cellInput}
                        list={origemDatalistId}
                      />
                    </td>
                    <td className="px-1 py-1.5 align-middle text-center">
                      <button
                        type="button"
                        onClick={() => removerLinha(l.id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 transition hover:bg-red-50 hover:text-red-600"
                        title="Remover linha"
                        aria-label={`Remover linha ${idx + 1}`}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <datalist id={origemDatalistId}>
          {ORIGEM_CONVIDADO_SUGESTOES.map((o) => (
            <option key={o} value={o} />
          ))}
        </datalist>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={adicionarLinha}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50"
          >
            <svg className="h-4 w-4 text-casamento-oliva-escuro" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Adicionar linha
          </button>
          <button
            type="button"
            onClick={() => setImportAberto((v) => !v)}
            className="inline-flex items-center rounded-lg border border-dashed border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-600 transition hover:border-casamento-sage hover:text-casamento-oliva-escuro"
          >
            {importAberto ? "Fechar importação" : "Colar do Excel ou texto"}
          </button>
        </div>

        {importAberto && (
          <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50/80 p-4">
            <p className="text-sm text-zinc-600">
              Cole do <strong className="font-medium text-zinc-800">Excel</strong> ou{" "}
              <strong className="font-medium text-zinc-800">Sheets</strong> com colunas:{" "}
              <strong>nome</strong>, <strong>acompanhantes</strong>, <strong>contato</strong>, <strong>grupo/origem</strong> (4 colunas). Se
              tiver só 3 colunas, a origem fica vazia. Texto:{" "}
              <code className="rounded bg-white px-1 py-0.5 text-xs text-zinc-800">nome;acompanhantes;contato;origem</code>.
            </p>
            <textarea
              value={textoImport}
              onChange={(e) => setTextoImport(e.target.value)}
              rows={5}
              placeholder={"Maria Silva\tJoão\t(11) 99999-9999\tAmigos da noiva\nPedro Santos;;;\nAna;Carlos;;Igreja"}
              className="mt-3 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 font-mono text-xs leading-relaxed focus:border-casamento-sage focus:outline-none focus:ring-2 focus:ring-casamento-pastel/50"
            />
            <button
              type="button"
              onClick={aplicarImport}
              className="mt-2 rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700"
            >
              Preencher tabela
            </button>
          </div>
        )}

        {erro && <p className="mt-4 text-sm text-red-600">{erro}</p>}
        {sucesso !== null && (
          <p
            className={`mt-4 text-sm font-medium ${sucesso > 0 ? "text-emerald-800" : "text-amber-800"}`}
          >
            {sucesso > 0
              ? `${sucesso} convidado(s) cadastrado(s) com sucesso.`
              : "Nenhum convidado foi cadastrado (verifique os dados ou tente de novo)."}
          </p>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-zinc-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-zinc-500">Linhas vazias são ignoradas. O nome é obrigatório em cada convidado.</p>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-casamento-oliva-escuro px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-casamento-oliva disabled:opacity-50 sm:w-auto"
          >
            {loading ? "Cadastrando…" : "Cadastrar todos"}
          </button>
        </div>
      </form>
    </section>
  );
}
