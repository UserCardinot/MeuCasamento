import Link from "next/link";
import { validateGuestToken } from "@/lib/auth";
import { getConvidadoByToken, getPresenteRegistrado } from "@/lib/google";
import { LISTA_PRESENTES } from "@/lib/presentes";
import FormPix from "./FormPix";
import QrCodePix from "./QrCodePix";

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
      <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-casamento-creme to-casamento-sage">
        <div className="text-center max-w-md">
          <p className="text-stone-600 text-lg">Link inválido.</p>
          <p className="text-stone-500 mt-2">Acesse através do link do seu convite.</p>
        </div>
      </main>
    );
  }

  const isValid = await validateGuestToken(token);
  if (!isValid) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-casamento-creme to-casamento-sage">
        <div className="text-center max-w-md">
          <p className="text-stone-600 text-lg">Link inválido ou expirado.</p>
        </div>
      </main>
    );
  }

  const [convidado, presenteRegistrado] = await Promise.all([
    getConvidadoByToken(token),
    getPresenteRegistrado(token),
  ]);
  const nome = convidado?.[1] || "Convidado";

  return (
    <main className="min-h-screen p-8 bg-gradient-to-b from-casamento-creme to-casamento-sage">
      <div className="max-w-2xl mx-auto">
        <Link
          href={`/convite?token=${token}`}
          className="text-casamento-verde hover:underline text-sm mb-6 inline-block"
        >
          ← Voltar ao convite
        </Link>

        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-stone-800 mb-2">Lista de Presentes</h1>
        <p className="text-stone-600 mb-8">Olá, {nome}! Escolha como deseja contribuir.</p>

        {presenteRegistrado ? (
          <div className="bg-casamento-sage border border-casamento-verde/50 text-stone-800 px-4 py-3 rounded-lg mb-8">
            <p className="font-medium">✓ Você já registrou sua contribuição</p>
            <p className="text-sm mt-1">
              {presenteRegistrado.presente}
              {presenteRegistrado.valor && ` – R$ ${presenteRegistrado.valor}`}
            </p>
          </div>
        ) : (
          <>
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-stone-800 mb-4">Opções de presentes</h2>
              <ul className="space-y-3">
                {LISTA_PRESENTES.map((p) => (
                  <li
                    key={p.id}
                    className="flex justify-between items-center py-2 border-b border-stone-200 last:border-0"
                  >
                    <span className="text-stone-700">{p.nome}</span>
                    {p.valorSugerido && (
                      <span className="text-casamento-verde font-medium">
                        R$ {p.valorSugerido.toFixed(2)}
                      </span>
                    )}
                    {!p.valorSugerido && (
                      <span className="text-stone-500 text-sm">À escolha</span>
                    )}
                  </li>
                ))}
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-semibold text-stone-800 mb-4">Pagar com Pix</h2>
              <QrCodePix />
              <FormPix token={token} />
            </section>
          </>
        )}
      </div>
    </main>
  );
}
