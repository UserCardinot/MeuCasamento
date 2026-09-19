"use client";

import { useCallback, useEffect, useState } from "react";

function extrairFileId(url: string): string | null {
  const m = url.match(/\/file\/d\/([^/]+)/);
  return m ? m[1] : null;
}

type Item = {
  nome: string;
  arquivo: string;
  data: string;
  momento?: string;
  tipo?: string;
};

type Props = {
  eventToken: string;
  /** Quando true, renderiza só o grid (aba da página /midia) */
  embedded?: boolean;
};

function urlPreviewGrande(fileId: string) {
  return `https://lh3.googleusercontent.com/d/${fileId}=w2400`;
}

function urlThumb(fileId: string) {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w600`;
}

function urlEmbedDrive(fileId: string) {
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

export default function GaleriaClient({ eventToken, embedded = false }: Props) {
  const [fotos, setFotos] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [indice, setIndice] = useState<number | null>(null);

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

  const fechar = useCallback(() => setIndice(null), []);

  const irAnterior = useCallback(() => {
    setIndice((i) => {
      if (i == null || fotos.length === 0) return i;
      return (i - 1 + fotos.length) % fotos.length;
    });
  }, [fotos.length]);

  const irProximo = useCallback(() => {
    setIndice((i) => {
      if (i == null || fotos.length === 0) return i;
      return (i + 1) % fotos.length;
    });
  }, [fotos.length]);

  useEffect(() => {
    if (indice == null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") fechar();
      if (e.key === "ArrowLeft") irAnterior();
      if (e.key === "ArrowRight") irProximo();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [indice, fechar, irAnterior, irProximo]);

  const itemAberto = indice != null ? fotos[indice] : null;
  const fileIdAberto = itemAberto ? extrairFileId(itemAberto.arquivo) : null;
  const ehVideo = itemAberto?.tipo === "video";

  const grid = (
    <>
      {loading && (
        <p className="py-16 text-center font-sans text-base text-invite-olive/70">
          Carregando álbum…
        </p>
      )}
      {!loading && erro && (
        <p className="py-10 text-center font-sans text-base text-invite-olive/80">{erro}</p>
      )}
      {!loading && !erro && fotos.length === 0 && (
        <p className="border-y border-dashed border-invite-olive/25 py-16 text-center font-sans text-base text-invite-olive/65">
          Nenhuma foto ainda. Seja o primeiro a compartilhar.
        </p>
      )}
      {!loading && !erro && fotos.length > 0 && (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 md:grid-cols-4">
          {fotos.map((f, i) => {
            const fileId = extrairFileId(f.arquivo);
            const thumbUrl = fileId ? urlThumb(fileId) : null;
            return (
              <button
                key={`${f.arquivo}-${i}`}
                type="button"
                onClick={() => setIndice(i)}
                className="group relative block overflow-hidden bg-invite-cream/60 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-invite-olive"
                aria-label={`Abrir ${f.tipo === "video" ? "vídeo" : "foto"} de ${f.nome}`}
              >
                {thumbUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={thumbUrl}
                    alt=""
                    className="aspect-square w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex aspect-square w-full items-center justify-center bg-invite-olive/[0.06] font-sans text-sm text-invite-olive/55">
                    {f.tipo === "video" ? "Vídeo" : "Foto"}
                  </div>
                )}
                {f.tipo === "video" && (
                  <span className="absolute left-2 top-2 bg-invite-olive/90 px-2 py-1 font-sans text-xs font-medium text-white">
                    Vídeo
                  </span>
                )}
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-invite-olive/75 to-transparent px-2.5 pb-2.5 pt-8">
                  <span className="block truncate font-sans text-sm text-white">{f.nome}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      {itemAberto && (
        <div
          className="fixed inset-0 z-[80] flex flex-col bg-invite-olive/92 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Visualização do álbum"
        >
          <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-4 sm:px-6">
            <p className="min-w-0 truncate font-sans text-base text-white/90 sm:text-lg">
              {itemAberto.nome}
              {fotos.length > 1 && (
                <span className="ml-2 text-white/55">
                  {indice! + 1} de {fotos.length}
                </span>
              )}
            </p>
            <button
              type="button"
              onClick={fechar}
              className="shrink-0 border border-white/40 bg-white/10 px-5 py-3 font-sans text-base font-medium text-white transition hover:bg-white/20"
            >
              Fechar
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 pb-4 sm:px-4">
            {fotos.length > 1 && (
              <button
                type="button"
                onClick={irAnterior}
                className="absolute left-2 z-10 flex h-14 w-14 items-center justify-center bg-white/15 text-2xl text-white transition hover:bg-white/25 sm:left-4 sm:h-16 sm:w-16"
                aria-label="Anterior"
              >
                ‹
              </button>
            )}

            <div className="flex h-full max-h-[calc(100vh-8rem)] w-full max-w-5xl items-center justify-center">
              {fileIdAberto && ehVideo ? (
                <iframe
                  title={itemAberto.nome}
                  src={urlEmbedDrive(fileIdAberto)}
                  className="h-[min(70vh,640px)] w-full max-w-4xl border-0 bg-black"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              ) : fileIdAberto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={urlPreviewGrande(fileIdAberto)}
                  alt={itemAberto.nome}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <p className="font-sans text-lg text-white/80">Não foi possível abrir este arquivo.</p>
              )}
            </div>

            {fotos.length > 1 && (
              <button
                type="button"
                onClick={irProximo}
                className="absolute right-2 z-10 flex h-14 w-14 items-center justify-center bg-white/15 text-2xl text-white transition hover:bg-white/25 sm:right-4 sm:h-16 sm:w-16"
                aria-label="Próximo"
              >
                ›
              </button>
            )}
          </div>

          {fotos.length > 1 && (
            <div className="flex shrink-0 justify-center gap-3 px-4 pb-5 sm:hidden">
              <button
                type="button"
                onClick={irAnterior}
                className="flex-1 border border-white/35 py-3.5 font-sans text-base text-white"
              >
                Anterior
              </button>
              <button
                type="button"
                onClick={irProximo}
                className="flex-1 border border-white/35 py-3.5 font-sans text-base text-white"
              >
                Próximo
              </button>
            </div>
          )}
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
        <p className="font-sans text-lg text-invite-olive/80">
          Escaneie o QR Code na mesa para ver a galeria.
        </p>
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
        <p className="mt-3 font-sans text-base text-invite-olive/70">
          Toque em uma foto para ampliar
        </p>
      </header>
      {grid}
    </div>
  );
}
