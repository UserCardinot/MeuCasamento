import { getAdminAtual } from "@/lib/admin-sessao";
import { getEventoAtual } from "@/lib/evento-atual";
import LoginForm from "./LoginForm";
import Dashboard from "./Dashboard";

export default async function AdminGuard() {
  const evento = await getEventoAtual();
  if (!evento) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-stone-50 px-6">
        <p className="text-sm text-stone-600">Nenhum evento configurado para este endereço.</p>
      </main>
    );
  }

  const admin = await getAdminAtual();
  if (!admin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-stone-100/90 via-stone-50 to-white px-6 py-24 sm:px-12">
        <div className="w-full max-w-sm">
          <LoginForm titulo={evento.titulo || evento.anfitrioes || "Painel do convite"} />
        </div>
      </main>
    );
  }

  return <Dashboard />;
}
