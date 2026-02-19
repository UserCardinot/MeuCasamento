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
      <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-casamento-creme to-casamento-sage">
        <div className="text-center max-w-md">
          <p className="text-stone-600 text-lg">Link inválido.</p>
          <p className="text-stone-500 mt-2">Escaneie o QR Code na mesa para enviar fotos e áudios.</p>
        </div>
      </main>
    );
  }

  const isValid = validateEventToken(eventToken);
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
    <main className="min-h-screen p-8 bg-gradient-to-b from-casamento-creme to-casamento-sage">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-stone-800 mb-2">Fotos e Áudios</h1>
        <p className="text-stone-600 mb-8">
          Envie suas fotos do casamento ou grave uma mensagem em áudio para Lucas e Beatriz!
        </p>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-stone-800 mb-4">📸 Enviar foto</h2>
          <UploadFotos eventToken={eventToken} />
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-800 mb-4">🎙️ Gravar áudio</h2>
          <GravarAudio eventToken={eventToken} />
        </section>
      </div>
    </main>
  );
}
