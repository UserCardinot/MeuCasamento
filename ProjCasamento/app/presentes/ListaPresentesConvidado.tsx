"use client";

import { useState } from "react";
import PagamentoPresente from "./PagamentoPresente";
import { presentesBtnOutline, presentesBtnPrimary, presentesCard } from "./presentesTheme";

type Presente = { nome: string; preco: string; url: string; imagem: string };

type Props = {
  token: string;
  catalog: Presente[];
  presenteRegistrado: { presente: string; valor?: string } | null;
};

export default function ListaPresentesConvidado({ token, catalog, presenteRegistrado }: Props) {
  const [presenteSelecionado, setPresenteSelecionado] = useState<Presente | null>(null);

  if (presenteRegistrado) {
    return (
      <div
        className={`${presentesCard} flex flex-col items-center gap-3 px-6 py-8 text-center sm:flex-row sm:text-left`}
        role="status"
      >
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-invite-olive text-invite-olive"
          aria-hidden
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 12.5l4 4 8-9"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <div>
          <p className="font-invite-caps text-[0.82rem] font-semibold uppercase tracking-[0.14em] text-invite-olive">
            Contribuição registrada
          </p>
          <p className="font-sans mt-1 text-sm text-invite-olive/85">
            {presenteRegistrado.presente}
            {presenteRegistrado.valor && ` — R$ ${presenteRegistrado.valor.replace(".", ",")}`}
          </p>
        </div>
      </div>
    );
  }

  if (catalog.length === 0) {
    return (
      <div className={`${presentesCard} px-8 py-14 text-center`}>
        <p className="font-heading text-lg italic text-invite-olive">Em breve</p>
        <p className="font-sans mt-3 text-sm text-invite-olive/75">
          Os noivos ainda estão organizando a lista. Volte em alguns dias.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {catalog.map((p, i) => {
          const selecionado = presenteSelecionado?.nome === p.nome;
          return (
            <article
              key={`${p.nome}-${i}`}
              className={`flex flex-col overflow-hidden border transition-shadow ${
                selecionado
                  ? "border-invite-olive/50 bg-white/90 shadow-md ring-1 ring-invite-olive/20"
                  : "border-invite-olive/25 bg-white/70 hover:border-invite-olive/40 hover:shadow-sm"
              }`}
            >
              {p.imagem && (
                <a
                  href={p.url || p.imagem}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block aspect-[4/3] border-b border-invite-olive/15 bg-invite-cream/50"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.imagem} alt={p.nome} className="h-full w-full object-cover" />
                </a>
              )}
              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <h3 className="font-heading text-lg italic leading-snug text-invite-olive sm:text-xl">{p.nome}</h3>
                {p.preco && (
                  <p className="font-invite-caps mt-2 text-[0.85rem] font-semibold uppercase tracking-[0.12em] text-invite-olive/90">
                    R$ {p.preco.replace(".", ",")}
                  </p>
                )}
                {p.url && (
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-invite-caps mt-3 inline-block text-[0.68rem] font-medium uppercase tracking-[0.14em] text-invite-olive/75 underline-offset-4 hover:text-invite-olive hover:underline"
                  >
                    Ver na loja
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setPresenteSelecionado(selecionado ? null : p)}
                  className={`mt-5 ${selecionado ? presentesBtnOutline : presentesBtnPrimary}`}
                >
                  {selecionado ? "Fechar" : "Contribuir"}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {presenteSelecionado && (
        <section className={`${presentesCard} mt-10 px-6 py-8 sm:px-8 sm:py-10`}>
          <PagamentoPresente
            key={presenteSelecionado.nome}
            token={token}
            presente={{
              nome: presenteSelecionado.nome,
              preco: presenteSelecionado.preco,
            }}
          />
        </section>
      )}
    </>
  );
}
