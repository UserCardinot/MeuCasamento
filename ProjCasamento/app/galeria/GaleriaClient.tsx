"use client";

import { useState, useEffect } from "react";

function extrairFileId(url: string): string | null {
  const m = url.match(/\/file\/d\/([^/]+)/);
  return m ? m[1] : null;
}

type Props = {
  eventToken: string;
  /** Quando true, renderiza só o grid (aba da página /midia) */
  embedded?: boolean;
};

export default function GaleriaClient({ eventToken, embedded = false }: Props) {
  const [fotos, setFotos] = useState<
    { nome: string; arquivo: string; data: string; momento?: string; tipo?: string }[]
  >([]);
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

  const grid = (
    <>
      {loading && (
        <p className="py-12 text-center font-sans text-sm text-invite-olive/70">Carregando fotos…</p>
      )}
      {!loading && erro && (
        <p className="py-8 text-center font-sans text-sm text-invite-olive/80">{erro}</p>
      )}
      {!loading && !erro && fotos.length === 0 && (
        <p className="border border-dashed border-invite-olive/30 bg-white/40 px-4 py-14 text-center font-sans text-sm text-invite-olive/60">
          Nenhuma foto enviada ainda. Seja o primeiro!
        </p>
      )}
      {!loading && !erro && fotos.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4">
          {fotos.map((f, i) => {
            const fileId = extrairFileId(f.arquivo);
            const thumbUrl = fileId
              ? `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`
              : null;
            return (
              <a
                key={`${f.arquivo}-${i}`}
                href={f.arquivo}
                target="_blank"
                rel="noopener noreferrer"
                className="group block overflow-hidden border border-invite-olive/20 bg-white/70 transition-transform hover:scale-[1.02] hover:border-invite-olive/40"
              >
                {thumbUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={thumbUrl}
                    alt={f.nome}
                    className="aspect-square w-full object-cover transition duration-300 group-hover:opacity-95"
                  />
                ) : (
                  <div className="flex aspect-square w-full items-center justify-center bg-invite-cream font-invite-caps text-[0.65rem] uppercase tracking-widest text-invite-olive/50">
                    {f.tipo === "video" ? "Vídeo" : "Foto"}
                  </div>
                )}
                <p className="truncate px-2 py-2 font-sans text-xs text-invite-olive/80">
                  {f.tipo === "video" ? `Vídeo · ${f.nome}` : f.nome}
                </p>
              </a>
            );
          })}
        </div>
      )}
    </>
  );

  if (embedded) {
    return <div>{grid}</div>;
  }

  if (!eventToken) {
    return (
      <div className="px-6 py-16 text-center">
        <p className="font-sans text-invite-olive/80">Escaneie o QR Code na mesa para ver a galeria.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <header className="mb-8 text-center sm:mb-10">
        <p className="font-invite-caps text-[0.68rem] font-medium uppercase tracking-[0.28em] text-invite-olive/80 sm:text-xs">
          Galeria
        </p>
        <h1 className="font-heading mt-3 text-[1.75rem] italic text-invite-olive sm:text-[2.1rem]">
          Fotos
        </h1>
        <p className="mt-3 font-sans text-sm text-invite-olive/70">Fotos enviadas pelos convidados</p>
      </header>
      {grid}
    </div>
  );
}
