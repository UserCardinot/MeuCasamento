import { InvitePageShell } from "@/components/invite/InvitePageShell";
import { presentesCard, presentesLayoutLoja } from "../presentes/presentesTheme";

export default function RecadosLoading() {
  return (
    <InvitePageShell className="flex min-h-screen flex-col items-center justify-center py-16">
      <div className={presentesLayoutLoja}>
        <div className={`${presentesCard} px-8 py-14 text-center`}>
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-invite-olive/20 border-t-invite-olive" />
          <p className="font-sans mt-4 text-sm text-invite-olive/70">Carregando mural…</p>
        </div>
      </div>
    </InvitePageShell>
  );
}
