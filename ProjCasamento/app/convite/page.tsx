import Link from "next/link";
import { validateGuestToken } from "@/lib/auth";
import { getConvidadoByToken, getPresencaStatus } from "@/lib/google";
import StatusPresenca from "./StatusPresenca";

type Props = {
  searchParams: Promise<{ token?: string | string[] }> | { token?: string | string[] };
};

export default async function ConvitePage({ searchParams }: Props) {
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
          <p className="text-stone-500 mt-2">Entre em contato com os noivos se acredita que isso é um erro.</p>
        </div>
      </main>
    );
  }

  const [convidado, presenca] = await Promise.all([
    getConvidadoByToken(token),
    getPresencaStatus(token),
  ]);
  const nome = convidado?.[1] || "Convidado";
  const jaConfirmou = presenca?.confirmado === true;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-casamento-creme to-casamento-sage">
      <div className="max-w-lg w-full text-center space-y-8">
        <div className="space-y-2">
          <p className="text-casamento-verde font-medium">Você está convidado(a)</p>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-stone-800">
            Lucas & Beatriz
          </h1>
          <p className="text-stone-600">convidam para a celebração do seu casamento</p>
        </div>

        <div className="py-6 border-y border-casamento-verde/30">
          <p className="text-stone-700">Sábado, 15 de Novembro de 2026</p>
          <p className="text-stone-600 mt-1"> às 18h</p>
          <p className="text-stone-500 mt-2 text-sm">
            [Endereço do local – configure no código]
          </p>
        </div>

        <p className="text-stone-600">Com muito carinho, {nome}.</p>

        <div className="flex flex-col gap-4 pt-4">
          {jaConfirmou ? (
            <StatusPresenca token={token} />
          ) : (
            <Link
              href={`/confirmacao?token=${token}`}
              className="px-6 py-3 bg-casamento-verde text-white font-medium rounded-lg hover:opacity-90 transition text-center"
            >
              Confirmar Presença
            </Link>
          )}
          <Link
            href={`/presentes?token=${token}`}
            className="px-6 py-3 border-2 border-casamento-verde text-casamento-verde font-medium rounded-lg hover:bg-casamento-sage transition text-center"
          >
            Lista de Presentes
          </Link>
        </div>
      </div>
    </main>
  );
}
