import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

/** Páginas do convidado: fundo creme com textura telado (referência markatto/linho). */
export function InvitePageShell({ children, className = "" }: Props) {
  return (
    <main className={`invite-page-shell relative min-h-screen ${className}`.trim()}>
      {children}
    </main>
  );
}
