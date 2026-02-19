import { redirect } from "next/navigation";
import { validateGuestToken } from "@/lib/auth";
import FormConfirmacao from "./FormConfirmacao";

type Props = {
  searchParams: { token?: string };
};

export default async function ConfirmacaoPage({ searchParams }: Props) {
  const token = searchParams?.token;

  if (!token || typeof token !== "string") {
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

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-casamento-creme to-casamento-sage">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-stone-800 text-center mb-6">
          Confirmar Presença
        </h1>
        <FormConfirmacao token={token} />
      </div>
    </main>
  );
}
