"use client";

import { useMemo, useState } from "react";
import { formatAcompanhantesLista, unirAcompanhantes } from "@/lib/acompanhantes";

type Props = {
  sugestoes: string[];
  selecionados: string[];
  onChange: (lista: string[]) => void;
};

const labelClass =
  "font-invite-caps mb-2.5 block text-[0.68rem] font-medium uppercase tracking-[0.16em] text-invite-olive sm:text-xs md:mb-3 md:text-sm";

const fieldClass =
  "w-full border border-invite-olive/25 bg-white/80 px-4 py-3.5 font-sans text-sm text-invite-olive placeholder:text-invite-olive/40 transition-colors focus:border-invite-olive/50 focus:outline-none focus:ring-2 focus:ring-invite-olive/20 md:px-5 md:py-4 md:text-base";

export default function SelecaoAcompanhantes({ sugestoes, selecionados, onChange }: Props) {
  const [novoNome, setNovoNome] = useState("");

  const extras = useMemo(
    () => selecionados.filter((n) => !sugestoes.some((s) => s.toLowerCase() === n.toLowerCase())),
    [selecionados, sugestoes]
  );

  const opcoes = useMemo(() => unirAcompanhantes(sugestoes, extras), [sugestoes, extras]);

  function estaSelecionado(nome: string) {
    return selecionados.some((s) => s.toLowerCase() === nome.toLowerCase());
  }

  function alternar(nome: string) {
    if (estaSelecionado(nome)) {
      onChange(selecionados.filter((s) => s.toLowerCase() !== nome.toLowerCase()));
    } else {
      onChange([...selecionados, nome]);
    }
  }

  function adicionarOutro() {
    const nome = novoNome.trim();
    if (!nome) return;
    if (!estaSelecionado(nome)) {
      onChange([...selecionados, nome]);
    }
    setNovoNome("");
  }

  if (sugestoes.length === 0 && selecionados.length === 0) {
    return (
      <div>
        <label htmlFor="acompanhantes-livre" className={labelClass}>
          Acompanhantes{" "}
          <span className="font-sans font-normal normal-case tracking-normal text-invite-olive/55">
            (opcional)
          </span>
        </label>
        <input
          id="acompanhantes-livre"
          type="text"
          value={formatAcompanhantesLista(selecionados)}
          onChange={(e) =>
            onChange(
              e.target.value
                .split(/[,;]/)
                .map((s) => s.trim())
                .filter(Boolean)
            )
          }
          placeholder="Nomes separados por vírgula"
          className={fieldClass}
        />
      </div>
    );
  }

  return (
    <div>
      <p className={labelClass}>Quem vai com você?</p>
      <p className="font-sans mb-4 text-sm normal-case tracking-normal text-invite-olive/75">
        Marque quem estará presente. Você pode alterar a lista do seu convite.
      </p>
      <ul className="space-y-2.5">
        {opcoes.map((nome) => {
          const ativo = estaSelecionado(nome);
          const doConvite = sugestoes.some((s) => s.toLowerCase() === nome.toLowerCase());
          return (
            <li key={nome}>
              <label
                className={`flex cursor-pointer items-center gap-3 border px-4 py-3.5 transition-colors ${
                  ativo
                    ? "border-invite-olive/45 bg-invite-olive/10"
                    : "border-invite-olive/25 bg-white/70 hover:border-invite-olive/40"
                }`}
              >
                <input
                  type="checkbox"
                  checked={ativo}
                  onChange={() => alternar(nome)}
                  className="h-4 w-4 shrink-0 accent-invite-olive"
                />
                <span className="font-sans text-sm text-invite-olive md:text-base">{nome}</span>
                {doConvite && (
                  <span className="font-invite-caps ml-auto text-[0.62rem] uppercase tracking-[0.12em] text-invite-olive/50">
                    No convite
                  </span>
                )}
              </label>
            </li>
          );
        })}
      </ul>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <label htmlFor="acompanhante-outro" className="sr-only">
            Outro acompanhante
          </label>
          <input
            id="acompanhante-outro"
            type="text"
            value={novoNome}
            onChange={(e) => setNovoNome(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                adicionarOutro();
              }
            }}
            placeholder="Outro nome (opcional)"
            className={fieldClass}
          />
        </div>
        <button
          type="button"
          onClick={adicionarOutro}
          className="font-invite-caps shrink-0 border border-invite-olive/35 bg-white/70 px-5 py-3.5 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-invite-olive hover:border-invite-olive/55 sm:py-4"
        >
          Adicionar
        </button>
      </div>
    </div>
  );
}
