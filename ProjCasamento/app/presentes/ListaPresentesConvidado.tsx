"use client";

import { useMemo, useState } from "react";
import CarrinhoPresentes from "./CarrinhoPresentes";
import PagamentoPresente from "./PagamentoPresente";
import { somaPrecosCatalogo } from "@/lib/presentes-checkout";
import { presentesBtnOutline, presentesBtnPrimary, presentesCard } from "./presentesTheme";

type Presente = { nome: string; preco: string; url: string; imagem: string };

type Props = {
  token: string;
  catalog: Presente[];
  presenteRegistrado: { presente: string; valor?: string } | null;
};

export default function ListaPresentesConvidado({ token, catalog, presenteRegistrado }: Props) {
  const [selecionados, setSelecionados] = useState<Presente[]>([]);
  const [mostrarPagamento, setMostrarPagamento] = useState(false);

  const totalSugerido = useMemo(() => somaPrecosCatalogo(selecionados), [selecionados]);

  function togglePresente(p: Presente) {
    setMostrarPagamento(false);
    setSelecionados((prev) => {
      const ja = prev.some((x) => x.nome === p.nome);
      if (ja) return prev.filter((x) => x.nome !== p.nome);
      return [...prev, p];
    });
  }

  function removerDoCarrinho(nome: string) {
    setMostrarPagamento(false);
    setSelecionados((prev) => prev.filter((x) => x.nome !== nome));
  }

  function limparCarrinho() {
    setMostrarPagamento(false);
    setSelecionados([]);
  }

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
      <p className="font-sans mb-6 text-center text-sm text-invite-olive/75 sm:text-left">
        Toque em <strong className="font-medium text-invite-olive">Selecionar</strong> nos presentes desejados.
        Eles aparecem no carrinho ao lado (telas grandes) ou abaixo.
      </p>

      <div className="xl:grid xl:grid-cols-[1fr_min(20rem,100%)] xl:items-start xl:gap-8">
        <div className="grid gap-5 sm:grid-cols-2">
          {catalog.map((p, i) => {
            const selecionado = selecionados.some((x) => x.nome === p.nome);
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
                    className="relative block aspect-[4/3] border-b border-invite-olive/15 bg-invite-cream/50"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.imagem} alt={p.nome} className="h-full w-full object-cover" />
                    {selecionado && (
                      <span className="font-invite-caps absolute right-2 top-2 bg-invite-olive px-2 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-white shadow-sm">
                        No carrinho
                      </span>
                    )}
                  </a>
                )}
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <h3 className="font-heading text-lg italic leading-snug text-invite-olive sm:text-xl">
                    {p.nome}
                  </h3>
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
                    onClick={() => togglePresente(p)}
                    className={`mt-5 ${selecionado ? presentesBtnOutline : presentesBtnPrimary}`}
                    aria-pressed={selecionado}
                  >
                    {selecionado ? "✓ No carrinho" : "Selecionar"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        <CarrinhoPresentes
          itens={selecionados}
          totalSugerido={totalSugerido}
          mostrarPagamento={mostrarPagamento}
          onRemover={removerDoCarrinho}
          onLimpar={limparCarrinho}
          onContinuar={() => setMostrarPagamento((v) => !v)}
          className="mt-8 xl:mt-0 xl:sticky xl:top-6"
        />
      </div>

      {mostrarPagamento && selecionados.length > 0 && (
        <section className={`${presentesCard} mt-6 px-6 py-8 sm:px-8 sm:py-10`}>
          <PagamentoPresente
            key={selecionados.map((p) => p.nome).join("|")}
            token={token}
            presentes={selecionados}
          />
        </section>
      )}
    </>
  );
}
