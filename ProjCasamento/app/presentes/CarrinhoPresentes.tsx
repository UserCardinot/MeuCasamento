"use client";

import { formatPrecoBRL } from "@/lib/presentes-checkout";
import { presentesBtnPrimary, presentesSidebar } from "./presentesTheme";

type Presente = { nome: string; preco: string; url: string; imagem: string };

type Props = {
  itens: Presente[];
  totalSugerido: number | null;
  onRemover: (nome: string) => void;
  onLimpar: () => void;
  onContinuar: () => void;
  onFechar?: () => void;
  className?: string;
};

function precoItem(preco: string | undefined): string {
  if (!preco?.trim()) return "Sem preço";
  return `R$ ${preco.replace(".", ",")}`;
}

export function IconeSacolaCompras({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path
        d="M6 2 3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M3 6h18" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M16 10a4 4 0 01-8 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function CarrinhoPresentes({
  itens,
  totalSugerido,
  onRemover,
  onLimpar,
  onContinuar,
  onFechar,
  className = "",
}: Props) {
  const vazio = itens.length === 0;

  return (
    <aside
      className={`${presentesSidebar} ${className}`}
      aria-label={vazio ? "Carrinho de presentes vazio" : `Carrinho com ${itens.length} itens`}
    >
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-invite-olive/20 bg-invite-olive/10 px-4 py-3.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-invite-olive/30 bg-white text-invite-olive shadow-sm">
            <IconeSacolaCompras className="h-[1.15rem] w-[1.15rem]" />
            {!vazio && (
              <span className="absolute -right-1 -top-1 flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-invite-olive px-1 font-sans text-[0.58rem] font-bold leading-none text-white">
                {itens.length}
              </span>
            )}
          </span>
          <div className="min-w-0">
            <p className="font-invite-caps text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-invite-olive">
              Carrinho
            </p>
            <p className="font-sans truncate text-xs text-invite-olive/65">
              {vazio ? "Nenhum item ainda" : `${itens.length} ${itens.length === 1 ? "item" : "itens"}`}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {!vazio && (
            <button
              type="button"
              onClick={onLimpar}
              className="font-invite-caps shrink-0 text-[0.62rem] font-medium uppercase tracking-[0.1em] text-invite-olive/60 underline-offset-2 hover:text-invite-olive hover:underline"
            >
              Limpar
            </button>
          )}
          {onFechar && (
            <button
              type="button"
              onClick={onFechar}
              className="flex h-8 w-8 items-center justify-center border border-invite-olive/25 bg-white text-invite-olive/70 transition-colors hover:border-invite-olive/45 hover:text-invite-olive"
              aria-label="Fechar carrinho"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {vazio ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
            <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-dashed border-invite-olive/30 bg-white/60 text-invite-olive/40">
              <IconeSacolaCompras className="h-7 w-7" />
            </span>
            <p className="font-sans text-sm text-invite-olive/70">
              Selecione presentes na lista ao lado para montar seu carrinho.
            </p>
          </div>
        ) : (
          <>
            <ul className="min-h-0 flex-1 divide-y divide-invite-olive/12 overflow-y-auto overscroll-y-contain">
              {itens.map((p) => (
                <li key={p.nome} className="flex gap-2.5 bg-white/40 px-3 py-2.5 sm:px-4 sm:py-3">
                  {p.imagem ? (
                    <div className="h-12 w-12 shrink-0 overflow-hidden border border-invite-olive/15 bg-invite-cream/60">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.imagem} alt="" className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center border border-invite-olive/15 bg-invite-cream/60"
                      aria-hidden
                    >
                      <span className="font-heading text-lg italic text-invite-olive/30">♥</span>
                    </div>
                  )}
                  <div className="flex min-w-0 flex-1 items-start justify-between gap-1">
                    <div className="min-w-0">
                      <p className="line-clamp-2 font-heading text-sm italic leading-snug text-invite-olive">
                        {p.nome}
                      </p>
                      <p className="font-invite-caps mt-0.5 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-invite-olive/85">
                        {precoItem(p.preco)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemover(p.nome)}
                      className="flex h-7 w-7 shrink-0 items-center justify-center border border-invite-olive/20 bg-white/90 text-invite-olive/60 transition-colors hover:border-invite-olive/40 hover:text-invite-olive"
                      aria-label={`Remover ${p.nome}`}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path
                          d="M6 6l12 12M18 6L6 18"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="shrink-0 border-t border-invite-olive/20 bg-invite-cream/95 px-4 py-3.5">
              <div className="flex items-end justify-between gap-3">
                <span className="font-invite-caps text-[0.65rem] font-medium uppercase tracking-[0.12em] text-invite-olive/75">
                  Total sugerido
                </span>
                <span className="font-heading text-xl italic tabular-nums text-invite-olive">
                  {totalSugerido != null ? `R$ ${formatPrecoBRL(totalSugerido)}` : "—"}
                </span>
              </div>
              <button type="button" onClick={onContinuar} className={`mt-3 ${presentesBtnPrimary}`}>
                Continuar para pagar
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
