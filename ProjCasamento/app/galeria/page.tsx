"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

function extrairFileId(url: string): string | null {
  const m = url.match(/\/file\/d\/([^/]+)/);
  return m ? m[1] : null;
}

export default function GaleriaPage() {
  const searchParams = useSearchParams();
  const eventToken = searchParams.get("eventToken") || "";
  const [fotos, setFotos] = useState<{ nome: string; arquivo: string; data: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!eventToken) {
      setErro("Link inválido. Acesse através do QR Code na mesa.");
      setLoading(false);
      return;
    }
    fetch(`/api/galeria?eventToken=${encodeURIComponent(eventToken)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.erro) setErro(data.erro);
        else setFotos(data.fotos || []);
      })
      .catch(() => setErro("Erro ao carregar fotos."))
      .finally(() => setLoading(false));
  }, [eventToken]);

  if (!eventToken) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 py-24 bg-[#FAFAFA]">
        <p className="text-stone-600">Escaneie o QR Code na mesa para ver a galeria.</p>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 py-24 bg-[#FAFAFA]">
        <p className="font-sans text-stone-600">Carregando fotos...</p>
      </main>
    );
  }

  if (erro) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 py-24 bg-[#FAFAFA]">
        <p className="text-stone-600">{erro}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 sm:px-12 lg:px-24 py-20 bg-[#FAFAFA]">
      <div className="max-w-4xl mx-auto">
        <p className="font-sans text-stone-400 text-xs uppercase tracking-widest mb-2">Galeria</p>
        <h1 className="font-heading text-3xl sm:text-4xl font-light text-stone-900 mb-4">Fotos</h1>
        <p className="font-sans text-stone-600 mb-12">Fotos enviadas pelos convidados</p>

        {fotos.length === 0 ? (
          <p className="font-sans text-stone-500 text-center py-16 bg-white rounded-2xl shadow-sm">Nenhuma foto enviada ainda.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {fotos.map((f, i) => {
              const fileId = extrairFileId(f.arquivo);
              const thumbUrl = fileId
                ? `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`
                : null;
              return (
                <a
                  key={i}
                  href={f.arquivo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow transition-all duration-200"
                >
                  {thumbUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thumbUrl} alt={f.nome} className="w-full aspect-square object-cover" />
                  ) : (
                    <div className="w-full aspect-square bg-stone-100 flex items-center justify-center text-stone-500">
                      Foto
                    </div>
                  )}
                  <p className="p-2 text-sm text-stone-600 truncate">{f.nome}</p>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
