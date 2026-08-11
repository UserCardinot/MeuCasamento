"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  presentesBtnOutline,
  presentesBtnPrimary,
  presentesFieldClass,
  presentesLabelClass,
} from "@/app/presentes/presentesTheme";

type Props = { eventToken: string };

type ItemStatus = "pending" | "uploading" | "done" | "error";

type QueueItem = {
  id: string;
  file: File;
  kind: "foto" | "video";
  previewUrl: string;
  status: ItemStatus;
  erro?: string;
};

const MAX_FOTO_MB = 10;
const MAX_VIDEO_MB = 50;
const MAX_ITENS = 20;

function isVideo(file: File) {
  return file.type.startsWith("video/");
}

function isImage(file: File) {
  return file.type.startsWith("image/");
}

function validateFile(file: File): string | null {
  if (isImage(file)) {
    if (file.size > MAX_FOTO_MB * 1024 * 1024) {
      return `Foto muito grande (máx. ${MAX_FOTO_MB}MB).`;
    }
    return null;
  }
  if (isVideo(file)) {
    if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
      return `Vídeo muito grande (máx. ${MAX_VIDEO_MB}MB).`;
    }
    return null;
  }
  return "Formato não suportado. Use foto ou vídeo.";
}

export default function UploadFotos({ eventToken }: Props) {
  const [itens, setItens] = useState<QueueItem[]>([]);
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);
  const [erroGeral, setErroGeral] = useState("");
  const [enviadosOk, setEnviadosOk] = useState(0);

  const cameraFotoRef = useRef<HTMLInputElement>(null);
  const cameraVideoRef = useRef<HTMLInputElement>(null);
  const galeriaRef = useRef<HTMLInputElement>(null);
  const baseId = useId();
  const seq = useRef(0);

  useEffect(() => {
    return () => {
      itens.forEach((i) => URL.revokeObjectURL(i.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- cleanup só no unmount
  }, []);

  const addFiles = useCallback((list: FileList | File[] | null) => {
    if (!list) return;
    setErroGeral("");
    setEnviadosOk(0);

    const incoming = Array.from(list);
    setItens((prev) => {
      const room = MAX_ITENS - prev.length;
      if (room <= 0) {
        setErroGeral(`Máximo de ${MAX_ITENS} arquivos na lista.`);
        return prev;
      }

      const next: QueueItem[] = [...prev];
      const erros: string[] = [];

      for (const file of incoming.slice(0, room)) {
        const err = validateFile(file);
        if (err) {
          erros.push(`${file.name}: ${err}`);
          continue;
        }
        seq.current += 1;
        next.push({
          id: `${baseId}-${seq.current}`,
          file,
          kind: isVideo(file) ? "video" : "foto",
          previewUrl: URL.createObjectURL(file),
          status: "pending",
        });
      }

      if (incoming.length > room) {
        erros.push(`Só cabem mais ${room} na lista (máx. ${MAX_ITENS}).`);
      }
      if (erros.length) setErroGeral(erros.slice(0, 3).join(" "));
      return next;
    });
  }, [baseId]);

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    addFiles(e.target.files);
    e.target.value = "";
  }

  function removerItem(id: string) {
    setItens((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  }

  function limparConcluidos() {
    setItens((prev) => {
      prev.filter((i) => i.status === "done").forEach((i) => URL.revokeObjectURL(i.previewUrl));
      return prev.filter((i) => i.status !== "done");
    });
  }

  async function enviarFila(e: React.FormEvent) {
    e.preventDefault();
    const pendentes = itens.filter((i) => i.status === "pending" || i.status === "error");
    if (pendentes.length === 0) {
      setErroGeral("Adicione fotos ou vídeos à lista.");
      return;
    }

    setLoading(true);
    setErroGeral("");
    setEnviadosOk(0);
    let okCount = 0;

    for (const item of pendentes) {
      setItens((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: "uploading", erro: undefined } : i))
      );

      try {
        const formData = new FormData();
        formData.append("file", item.file);
        formData.append("tipo", item.kind);
        formData.append("eventToken", eventToken);
        if (nome.trim()) formData.append("nome", nome.trim());

        const res = await fetch("/api/enviar-midia", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();

        if (!res.ok) {
          setItens((prev) =>
            prev.map((i) =>
              i.id === item.id
                ? { ...i, status: "error", erro: data.erro || "Falha no envio" }
                : i
            )
          );
          continue;
        }

        okCount += 1;
        setEnviadosOk(okCount);
        setItens((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, status: "done" } : i))
        );
      } catch {
        setItens((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? { ...i, status: "error", erro: "Erro de conexão" }
              : i
          )
        );
      }
    }

    setLoading(false);
    if (okCount > 0) {
      // remove enviados após breve feedback
      setTimeout(() => limparConcluidos(), 1200);
    }
  }

  const pendentes = itens.filter((i) => i.status === "pending" || i.status === "error").length;
  const btnClass =
    "font-invite-caps flex flex-1 flex-col items-center justify-center gap-1.5 border border-invite-olive/35 bg-white/70 px-3 py-4 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-invite-olive transition-colors hover:border-invite-olive/55 hover:bg-white/90 active:scale-[0.99] sm:text-[0.7rem]";

  return (
    <form onSubmit={enviarFila} className="space-y-5">
      <div>
        <label htmlFor="midia-nome" className={presentesLabelClass}>
          Seu nome (opcional)
        </label>
        <input
          id="midia-nome"
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex: Maria"
          className={presentesFieldClass}
          autoComplete="name"
        />
      </div>

      <div>
        <p className={presentesLabelClass}>Adicionar à lista</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <button
            type="button"
            className={btnClass}
            onClick={() => cameraFotoRef.current?.click()}
          >
            Tirar foto
          </button>
          <button
            type="button"
            className={btnClass}
            onClick={() => cameraVideoRef.current?.click()}
          >
            Gravar vídeo
          </button>
          <button
            type="button"
            className={btnClass}
            onClick={() => galeriaRef.current?.click()}
          >
            Da galeria
          </button>
        </div>
        <p className="mt-2 font-sans text-xs text-invite-olive/55">
          No celular, “Tirar foto” / “Grav. vídeo” abrem a câmera. Depois continue adicionando — a
          lista acumula até você enviar.
        </p>

        {/* Câmera: foto */}
        <input
          ref={cameraFotoRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={onInputChange}
        />
        {/* Câmera: vídeo */}
        <input
          ref={cameraVideoRef}
          type="file"
          accept="video/*"
          capture="environment"
          className="sr-only"
          onChange={onInputChange}
        />
        {/* Galeria do aparelho (vários) */}
        <input
          ref={galeriaRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="sr-only"
          onChange={onInputChange}
        />
      </div>

      {itens.length > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className={presentesLabelClass + " !mb-0"}>
              Lista ({itens.length}/{MAX_ITENS})
            </p>
            {itens.some((i) => i.status === "done") && (
              <button
                type="button"
                onClick={limparConcluidos}
                className="font-invite-caps text-[0.62rem] uppercase tracking-[0.14em] text-invite-olive/60 hover:text-invite-olive"
              >
                Limpar enviados
              </button>
            )}
          </div>

          <ul className="space-y-2">
            {itens.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 border border-invite-olive/20 bg-white/60 p-2.5"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden bg-invite-cream sm:h-20 sm:w-20">
                  {item.kind === "video" ? (
                    <video
                      src={item.previewUrl}
                      className="h-full w-full object-cover"
                      muted
                      playsInline
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.previewUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )}
                  <span className="absolute bottom-0 left-0 bg-invite-olive/90 px-1 py-0.5 font-invite-caps text-[0.55rem] uppercase tracking-wider text-white">
                    {item.kind === "video" ? "Vídeo" : "Foto"}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-sans text-sm text-invite-olive">{item.file.name}</p>
                  <p className="mt-0.5 font-sans text-xs text-invite-olive/55">
                    {(item.file.size / (1024 * 1024)).toFixed(1)} MB
                    {item.status === "pending" && " · na fila"}
                    {item.status === "uploading" && " · enviando…"}
                    {item.status === "done" && " · enviado"}
                    {item.status === "error" && ` · ${item.erro || "erro"}`}
                  </p>
                </div>

                {item.status !== "uploading" && (
                  <button
                    type="button"
                    onClick={() => removerItem(item.id)}
                    className="shrink-0 font-invite-caps text-[0.6rem] uppercase tracking-[0.12em] text-invite-olive/50 hover:text-invite-olive"
                    aria-label="Remover"
                  >
                    Remover
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {erroGeral && (
        <div className="border border-red-300/50 bg-red-50/80 px-4 py-3" role="alert">
          <p className="font-sans text-sm text-red-800">{erroGeral}</p>
        </div>
      )}

      {enviadosOk > 0 && !loading && (
        <div className="border border-invite-olive/30 bg-invite-olive/10 px-4 py-3" role="status">
          <p className="font-invite-caps text-[0.7rem] font-medium uppercase tracking-[0.14em] text-invite-olive">
            {enviadosOk === 1 ? "1 arquivo enviado" : `${enviadosOk} arquivos enviados`}
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || pendentes === 0}
        className={presentesBtnPrimary}
      >
        {loading
          ? "Enviando…"
          : pendentes > 1
            ? `Enviar ${pendentes} arquivos`
            : pendentes === 1
              ? "Enviar 1 arquivo"
              : "Enviar"}
      </button>

      {itens.length > 0 && !loading && (
        <button
          type="button"
          onClick={() => {
            itens.forEach((i) => URL.revokeObjectURL(i.previewUrl));
            setItens([]);
            setEnviadosOk(0);
          }}
          className={presentesBtnOutline}
        >
          Limpar lista
        </button>
      )}
    </form>
  );
}
