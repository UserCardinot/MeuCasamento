"use client";

import { useEffect, type ReactNode } from "react";
import { presentesModalPanel } from "./presentesTheme";

type Props = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

export default function ModalPagamentoPresente({ open, onClose, children }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-4 md:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-pagamento-titulo"
    >
      <button
        type="button"
        className="absolute inset-0 bg-zinc-900/55 backdrop-blur-sm"
        aria-label="Fechar pagamento"
        onClick={onClose}
      />
      <div
        className={`${presentesModalPanel} relative z-10 flex max-h-[min(92vh,40rem)] w-full max-w-lg flex-col sm:max-h-[min(88vh,44rem)] sm:rounded-sm`}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-invite-olive/25 bg-invite-cream px-5 py-4 sm:px-6">
          <h2
            id="modal-pagamento-titulo"
            className="font-heading text-lg italic text-invite-olive sm:text-xl"
          >
            Finalizar contribuição
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center border border-invite-olive/30 bg-white text-invite-olive/70 transition-colors hover:border-invite-olive/50 hover:text-invite-olive"
            aria-label="Fechar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain bg-invite-cream px-5 py-6 sm:px-6 sm:py-7">
          {children}
        </div>
      </div>
    </div>
  );
}
