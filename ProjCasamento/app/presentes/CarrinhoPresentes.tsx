"use client";

import { formatPrecoBRL } from "@/lib/presentes-checkout";
import { presentesBtnOutline, presentesBtnPrimary, presentesCard } from "./presentesTheme";

type Presente = { nome: string; preco: string; url: string; imagem: string };

type Props = {
  itens: Presente[];
  totalSugerido: number | null;
  mostrarPagamento: boolean;
  onRemover: (nome: string) => void;
  onLimpar: () => void;
  onContinuar: () => void;
  className?: string;
};

function precoItem(preco: string | undefined): string {
  if (!preco?.trim()) return "Sem preço na lista";
  return `R$ ${preco.replace(".", ",")}`;
}

function IconeCarrinho() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
      <path
        d="M6 6h15l-1.5 9h-12L5 3H2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="20" r="1.25" fill="currentColor" />
      <circle cx="18" cy="20" r="1.25" fill="currentColor" />
    </svg>
  );
}

export default function CarrinhoPresentes({
  itens,
  totalSugerido,
  mostrarPagamento,
  onRemover,
  onLimpar,
  onContinuar,
  className = "",
}: Props) {
  if (itens.length === 0) return null;

  return (
    <aside
      className={`${presentesCard} overflow-hidden ${className}`}
      aria-label={`Carrinho com ${itens.length} ${itens.length === 1 ? "item" : "itens"}`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-invite-olive/20 bg-invite-olive/8 px-4 py-3.5 sm:px-5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-full border border-invite-olive/25 bg-white/80 text-invite-olive">
            <IconeCarrinho />
            <span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-invite-olive px-1 font-sans text-[0.6rem] font-bold text-white">
              {itens.length}
            </span>
          </span>
          <div className="min-w-0">
            <p className="font-invite-caps text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-invite-olive">
              Sua seleção
            </p>
            <p className="font-sans text-xs text-invite-olive/70">Revise os itens antes de pagar</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onLimpar}
          className="font-invite-caps shrink-0 text-[0.65rem] font-medium uppercase tracking-[0.12em] text-invite-olive/65 underline-offset-2 hover:text-invite-olive hover:underline"
        >
          Limpar
        </button>
      </div>

      <ul className="max-h-[min(20rem,50vh)] divide-y divide-invite-olive/15 overflow-y-auto">
        {itens.map((p) => (
          <li key={p.nome} className="flex gap-3 bg-white/50 px-4 py-3.5 sm:gap-4 sm:px-5 sm:py-4">
            {p.imagem ? (
              <div className="h-16 w-16 shrink-0 overflow-hidden border border-invite-olive/15 bg-invite-cream/60 sm:h-[4.5rem] sm:w-[4.5rem]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.imagem} alt="" className="h-full w-full object-cover" />
              </div>
            ) : (
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center border border-invite-olive/15 bg-invite-cream/60 sm:h-[4.5rem] sm:w-[4.5rem]"
                aria-hidden
              >
                <span className="font-heading text-2xl italic text-invite-olive/35">♥</span>
              </div>
            )}
            <div className="flex min-w-0 flex-1 items-start justify-between gap-2">
              <div className="min-w-0 pr-1">
                <p className="font-heading text-base italic leading-snug text-invite-olive sm:text-lg">
                  {p.nome}
                </p>
                <p className="font-invite-caps mt-1.5 text-[0.78rem] font-semibold uppercase tracking-[0.1em] text-invite-olive">
                  {precoItem(p.preco)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onRemover(p.nome)}
                className="flex h-8 w-8 shrink-0 items-center justify-center border border-invite-olive/25 bg-white/90 text-invite-olive/70 transition-colors hover:border-invite-olive/45 hover:bg-white hover:text-invite-olive"
                aria-label={`Remover ${p.nome}`}
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
            </div>
          </li>
        ))}
      </ul>

      <div className="border-t border-invite-olive/20 bg-invite-cream/90 px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex items-end justify-between gap-4">
          <span className="font-invite-caps text-[0.72rem] font-medium uppercase tracking-[0.14em] text-invite-olive/80">
            Total sugerido
          </span>
          <span className="font-heading text-2xl italic tabular-nums text-invite-olive sm:text-[1.65rem]">
            {totalSugerido != null ? `R$ ${formatPrecoBRL(totalSugerido)}` : "—"}
          </span>
        </div>
        <p className="font-sans mt-3 text-xs leading-relaxed text-invite-olive/65">
          No cartão, o Mercado Pago cobra a soma dos itens com preço na lista.
        </p>
        <button
          type="button"
          onClick={onContinuar}
          className={`mt-4 ${mostrarPagamento ? presentesBtnOutline : presentesBtnPrimary}`}
        >
          {mostrarPagamento ? "Ocultar pagamento" : "Continuar para pagar"}
        </button>
      </div>
    </aside>
  );
}
