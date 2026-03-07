import Link from "next/link";
import { validateEventToken } from "@/lib/auth";
import UploadFotos from "./UploadFotos";
import GravarAudio from "./GravarAudio";

type Props = {
  searchParams: Promise<{ eventToken?: string | string[] }> | { eventToken?: string | string[] };
};

export default async function MidiaPage({ searchParams }: Props) {
  const params = await searchParams;
  const raw = params?.eventToken;
  const eventToken = (typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : undefined)
    ?.toString()
    .trim();

  if (!eventToken) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 py-24 bg-[#FAFAFA]">
        <p className="text-stone-600 text-xl">Link inválido.</p>
        <p className="text-stone-500 mt-2">Escaneie o QR Code na mesa.</p>
      </main>
    );
  }

  const isValid = validateEventToken(eventToken);
  if (!isValid) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 py-24 bg-[#FAFAFA]">
        <p className="text-stone-600 text-xl">Link inválido ou expirado.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 sm:px-12 lg:px-24 py-20 bg-[#FAFAFA]">
      <div className="max-w-2xl mx-auto">
        <p className="font-sans text-stone-400 text-xs uppercase tracking-widest mb-2">Mídia</p>
        <h1 className="font-heading text-3xl sm:text-4xl font-light text-stone-900 mb-4">Fotos e áudios</h1>
        <p className="font-sans text-stone-600 mb-12">
          Envie fotos ou grave uma mensagem em áudio para Lucas e Beatriz!
        </p>
        <Link
          href={`/galeria?eventToken=${eventToken}`}
          className="inline-flex items-center gap-2 font-sans text-casamento-oliva-escuro hover:underline text-sm font-medium mb-12 focus:ring-2 focus:ring-casamento-oliva focus:ring-offset-2 rounded"
        >
          Ver galeria de fotos →
        </Link>

        <section className="mb-12 bg-white rounded-2xl shadow-sm p-8">
          <h2 className="font-heading text-xl font-light text-stone-800 mb-6">Enviar foto</h2>
          <UploadFotos eventToken={eventToken} />
        </section>

        <section className="bg-white rounded-2xl shadow-sm p-8">
          <h2 className="font-heading text-xl font-light text-stone-800 mb-6">Gravar áudio</h2>
          <GravarAudio eventToken={eventToken} />
        </section>
      </div>
    </main>
  );
}
