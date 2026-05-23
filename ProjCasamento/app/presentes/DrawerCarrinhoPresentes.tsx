"use client";

import { useEffect } from "react";
import CarrinhoPresentes from "./CarrinhoPresentes";
import type { ComponentProps } from "react";

type CarrinhoProps = ComponentProps<typeof CarrinhoPresentes>;

type Props = CarrinhoProps & {
  open: boolean;
  onClose: () => void;
};

export default function DrawerCarrinhoPresentes({ open, onClose, ...carrinhoProps }: Props) {
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

  return (
    <div
      className={`fixed inset-0 z-50 ${open ? "pointer-events-auto" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <button
        type="button"
        className={`absolute inset-0 bg-zinc-900/50 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        aria-label="Fechar carrinho"
        onClick={onClose}
        tabIndex={open ? 0 : -1}
      />
      <div
        className={`absolute inset-y-0 right-0 flex w-[min(100%,20.5rem)] flex-col transition-transform duration-300 ease-out md:w-[min(100%,24rem)] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Carrinho de presentes"
      >
        <CarrinhoPresentes
          {...carrinhoProps}
          onFechar={onClose}
          className="h-full max-h-full min-h-0 rounded-none border-y-0 border-r-0 shadow-2xl"
        />
      </div>
    </div>
  );
}
