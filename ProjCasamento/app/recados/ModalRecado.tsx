"use client";

import { useEffect } from "react";
import { presentesModalPanel } from "../presentes/presentesTheme";

type Recado = { nome: string; mensagem: string; data: string };

type Props = {
  recado: Recado | null;
  onClose: () => void;
};

export default function ModalRecado({ recado, onClose }: Props) {
  const open = recado != null;

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

  if (!recado) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-recado-titulo"
    >
      <button
        type="button"
        className="absolute inset-0 bg-zinc-900/55 backdrop-blur-sm"
        aria-label="Fechar recado"
        onClick={onClose}
      />
      <div className={`${presentesModalPanel} relative z-10 w-full max-w-lg sm:rounded-sm`}>
        <div className="flex items-start justify-between gap-3 border-b border-invite-olive/25 bg-invite-cream px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="font-invite-caps text-[0.65rem] font-medium uppercase tracking-[0.16em] text-invite-olive/70">
              Recado de
            </p>
            <h2
              id="modal-recado-titulo"
              className="font-heading mt-1 text-xl italic leading-snug text-invite-olive sm:text-2xl"
            >
              {recado.nome}
            </h2>
            {recado.data && (
              <p className="font-invite-caps mt-2 text-[0.62rem] font-medium uppercase tracking-[0.12em] text-invite-olive/50">
                {recado.data}
              </p>
            )}
          </div>
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
        <div className="max-h-[min(70vh,24rem)] overflow-y-auto overscroll-y-contain bg-invite-cream px-5 py-6 sm:px-6 sm:py-7">
          <p className="font-sans whitespace-pre-wrap text-base leading-relaxed text-invite-olive/90">
            {recado.mensagem}
          </p>
        </div>
      </div>
    </div>
  );
}
