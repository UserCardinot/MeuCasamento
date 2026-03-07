import { validateGuestToken } from "@/lib/auth";
import FormConfirmacao from "./FormConfirmacao";

type Props = {
  searchParams: { token?: string };
};

function ErroConfirmacao({ mensagem, detalhe }: { mensagem: string; detalhe?: string }) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 sm:px-12 lg:px-24 py-24 bg-[#FAFAFA]">
      <div className="max-w-lg text-center space-y-4">
        <p className="font-sans text-stone-600 text-xl font-medium">{mensagem}</p>
        {detalhe && <p className="text-stone-500">{detalhe}</p>}
      </div>
    </main>
  );
}

export default async function ConfirmacaoPage({ searchParams }: Props) {
  const token = searchParams?.token;

  if (!token || typeof token !== "string") {
    return <ErroConfirmacao mensagem="Link inválido." detalhe="Acesse através do link do seu convite." />;
  }

  const isValid = await validateGuestToken(token);
  if (!isValid) {
    return <ErroConfirmacao mensagem="Link inválido ou expirado." />;
  }

  return (
    <main className="min-h-screen px-6 sm:px-12 lg:px-24 py-20 sm:py-32 bg-[#FAFAFA]">
      <div className="max-w-xl mx-auto">
        <p className="font-sans text-stone-400 text-xs uppercase tracking-widest mb-2">RSVP</p>
        <h1 className="font-heading text-3xl sm:text-4xl font-light text-stone-900 mb-12">
          Confirmar presença
        </h1>
        <FormConfirmacao token={token} />
      </div>
    </main>
  );
}
