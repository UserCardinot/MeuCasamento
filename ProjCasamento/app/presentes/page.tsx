import Link from "next/link";
import { validateGuestToken } from "@/lib/auth";
import { getConvidadoByToken, getPresenteRegistrado, getCatalogoPresentes } from "@/lib/google";
import ListaPresentesConvidado from "./ListaPresentesConvidado";

type Props = {
  searchParams: Promise<{ token?: string | string[] }> | { token?: string | string[] };
};

export default async function PresentesPage({ searchParams }: Props) {
  const params = await searchParams;
  const raw = params?.token;
  const token = (typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : undefined)
    ?.toString()
    .trim();

  if (!token) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 sm:px-12 py-24 bg-[#FAFAFA]">
        <p className="text-stone-600 text-xl">Link inválido.</p>
        <p className="text-stone-500 mt-2">Acesse através do link do seu convite.</p>
      </main>
    );
  }

  const isValid = await validateGuestToken(token);
  if (!isValid) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 sm:px-12 py-24 bg-[#FAFAFA]">
        <p className="text-stone-600 text-xl">Link inválido ou expirado.</p>
      </main>
    );
  }

  const [convidado, presenteRegistrado, catalogo] = await Promise.all([
    getConvidadoByToken(token),
    getPresenteRegistrado(token),
    getCatalogoPresentes(),
  ]);
  const nome = convidado?.[1] || "Convidado";

  return (
    <main className="min-h-screen px-6 sm:px-12 lg:px-24 py-20 bg-[#FAFAFA]">
      <div className="max-w-4xl mx-auto">
        <Link
          href={`/convite?token=${token}`}
          className="font-sans text-stone-500 hover:text-casamento-oliva-escuro text-sm font-medium transition-colors inline-flex items-center gap-2 mb-12 focus:ring-2 focus:ring-casamento-oliva focus:ring-offset-2 rounded"
        >
          ← Voltar ao convite
        </Link>

        <p className="font-sans text-stone-400 text-xs uppercase tracking-widest mb-2">Lista de presentes</p>
        <h1 className="font-heading text-3xl sm:text-4xl font-light text-stone-900 mb-4">Escolha seu presente</h1>
        <p className="font-sans text-stone-600 mb-12">Olá, {nome}! Contribua com Pix.</p>

        <ListaPresentesConvidado
          token={token}
          catalog={catalogo}
          presenteRegistrado={presenteRegistrado}
        />
      </div>
    </main>
  );
}
