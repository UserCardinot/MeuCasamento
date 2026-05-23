"use client";

import { formatPrecoBRL } from "@/lib/presentes-checkout";
import { IconeSacolaCompras } from "./CarrinhoPresentes";

type Props = {
  quantidade: number;
  total: number | null;
  onVerCarrinho: () => void;
  onDispensar: () => void;
  /** fixo no topo (mobile) ou faixa na lista (desktop) */
  variant?: "mobile" | "inline";
};

function textoItens(quantidade: number): string {
  return quantidade === 1 ? "1 item no carrinho" : `${quantidade} itens no carrinho`;
}

export default function AlertaCarrinhoPresentes({
  quantidade,
  total,
  onVerCarrinho,
  onDispensar,
  variant = "inline",
}: Props) {
  const isMobile = variant === "mobile";

  return (
    <div
      role="status"
      className={
        isMobile
          ? "fixed left-3 right-[4.25rem] top-3 z-40 md:hidden"
          : "mb-3 hidden md:block"
      }
    >
      <div className="flex items-stretch gap-0 overflow-hidden border border-invite-olive/35 bg-invite-cream shadow-md ring-1 ring-invite-olive/10">
        <button
          type="button"
          onClick={onVerCarrinho}
          className="flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-invite-olive/5 sm:gap-3 sm:px-4 sm:py-3"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-invite-olive/12 text-invite-olive">
            <IconeSacolaCompras className="h-4 w-4" />
          </span>
          <span className="min-w-0">
            <span className="font-invite-caps block text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-invite-olive">
              Você tem coisas no carrinho
            </span>
            <span className="font-sans mt-0.5 block text-xs leading-snug text-invite-olive/80">
              {textoItens(quantidade)}
              {total != null && (
                <>
                  {" "}
                  · <span className="font-medium text-invite-olive">R$ {formatPrecoBRL(total)}</span>
                </>
              )}
            </span>
            <span className="font-invite-caps mt-1 inline-block text-[0.6rem] font-medium uppercase tracking-[0.1em] text-invite-olive/55">
              Clique para ver o carrinho →
            </span>
          </span>
        </button>
        <button
          type="button"
          onClick={onDispensar}
          className="flex w-9 shrink-0 items-center justify-center border-l border-invite-olive/20 bg-white/50 text-invite-olive/50 transition-colors hover:bg-white hover:text-invite-olive"
          aria-label="Dispensar aviso do carrinho"
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
    </div>
  );
}
