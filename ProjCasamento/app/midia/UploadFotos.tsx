"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  presentesBtnOutline,
  presentesBtnPrimary,
  presentesFieldClass,
  presentesLabelClass,
} from "@/app/presentes/presentesTheme";
import { compressImageForUpload } from "@/lib/compress-image";
import { readCaptureHint } from "@/lib/capture-hint";
import {
  formatBytes,
  releaseScreenWakeLock,
  requestScreenWakeLock,
  uploadRawFileWithProgress,
  uploadWithProgress,
} from "@/lib/upload-with-progress";

type Props = { eventToken: string };

type ItemStatus = "pending" | "preparing" | "uploading" | "saving" | "done" | "error";

type QueueItem = {
  id: string;
  file: File;
  kind: "foto" | "video";
  previewUrl: string;
  status: ItemStatus;
  /** 0–100 enquanto envia o arquivo */
  progress?: number;
  loadedBytes?: number;
  totalBytes?: number;
  erro?: string;
};

const MAX_ITENS = 100;

function isOnVercelHost() {
  if (typeof window === "undefined") return false;
  return /\.vercel\.app$/i.test(window.location.hostname);
}

function isVideo(file: File) {
  return file.type.startsWith("video/");
}

function isImage(file: File) {
  return file.type.startsWith("image/");
}

function validateFile(file: File): string | null {
  if (isImage(file)) return null;
  if (isVideo(file)) {
    // Só avisa no host Vercel (limite ~4,5MB do Hobby)
    if (isOnVercelHost() && file.size > 3.8 * 1024 * 1024) {
      return `Neste site (Vercel) o vídeo precisa ser curto (~3,8MB). Use meucasamento.lumenemotion.com.br.`;
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
  const [filaInfo, setFilaInfo] = useState<{ atual: number; total: number } | null>(null);

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

  const addFiles = useCallback(
    (list: FileList | File[] | null) => {
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
    },
    [baseId]
  );

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

    const totalFila = pendentes.length;
    setFilaInfo({ atual: 0, total: totalFila });
    let idxFila = 0;

    const wake = await requestScreenWakeLock();
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        setErroGeral(
          "Não saia desta tela nem apague o celular enquanto envia — o navegador cancela o upload em segundo plano."
        );
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    try {
    for (const item of pendentes) {
      idxFila += 1;
      setFilaInfo({ atual: idxFila, total: totalFila });
      setItens((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? {
                ...i,
                status: "preparing",
                progress: 0,
                loadedBytes: 0,
                totalBytes: i.file.size,
                erro: undefined,
              }
            : i
        )
      );

      try {
        let fileToSend = item.file;
        let captureAt: string | null = null;

        if (item.kind === "foto") {
          captureAt = await readCaptureHint(item.file);
          // Compacta só na Vercel (limite ~4,5MB). Na VPS envia original.
          if (isOnVercelHost()) {
            try {
              fileToSend = await compressImageForUpload(item.file);
            } catch {
              fileToSend = item.file;
            }
            if (fileToSend.size > 4.2 * 1024 * 1024) {
              setItens((prev) =>
                prev.map((i) =>
                  i.id === item.id
                    ? {
                        ...i,
                        status: "error",
                        erro: "Foto ainda grande demais neste host (Vercel). Use meucasamento.lumenemotion.com.br.",
                      }
                    : i
                )
              );
              continue;
            }
          }
        }

        setItens((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? {
                  ...i,
                  status: "uploading",
                  progress: 0,
                  totalBytes: fileToSend.size,
                }
              : i
          )
        );

        const onProg = (p: { percent: number; loaded: number; total: number }) => {
          setItens((prev) =>
            prev.map((i) => {
              if (i.id !== item.id) return i;
              if (p.percent >= 100) {
                return {
                  ...i,
                  status: "saving",
                  progress: 100,
                  loadedBytes: p.loaded,
                  totalBytes: p.total,
                };
              }
              return {
                ...i,
                status: "uploading",
                progress: p.percent,
                loadedBytes: p.loaded,
                totalBytes: p.total,
              };
            })
          );
        };

        // Vídeos (e arquivos grandes): corpo cru → menos RAM e progresso mais estável
        const useRaw =
          item.kind === "video" || fileToSend.size >= 40 * 1024 * 1024;

        let ok = false;
        let data: { erro?: string } = {};

        if (useRaw) {
          const result = await uploadRawFileWithProgress(
            "/api/enviar-midia",
            fileToSend,
            {
              "x-raw-upload": "1",
              "x-event-token": eventToken,
              "x-tipo": item.kind,
              "x-nome": encodeURIComponent(nome.trim() || "Anônimo"),
              "x-filename": encodeURIComponent(fileToSend.name || "video.mp4"),
              "x-mime": fileToSend.type || "video/mp4",
              "Content-Type": fileToSend.type || "application/octet-stream",
            },
            onProg
          );
          ok = result.ok;
          data = result.data;
        } else {
          const formData = new FormData();
          formData.append("file", fileToSend);
          formData.append("tipo", item.kind);
          formData.append("eventToken", eventToken);
          if (nome.trim()) formData.append("nome", nome.trim());
          if (captureAt) formData.append("captureAt", captureAt);

          const result = await uploadWithProgress("/api/enviar-midia", formData, onProg);
          ok = result.ok;
          data = result.data;
        }

        if (!ok) {
          setItens((prev) =>
            prev.map((i) =>
              i.id === item.id
                ? {
                    ...i,
                    status: "error",
                    erro: data.erro || "Falha no envio",
                    progress: undefined,
                  }
                : i
            )
          );
          continue;
        }

        okCount += 1;
        setEnviadosOk(okCount);
        setItens((prev) =>
          prev.map((i) =>
            i.id === item.id ? { ...i, status: "done", progress: 100 } : i
          )
        );
      } catch {
        setItens((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? {
                  ...i,
                  status: "error",
                  erro:
                    "Envio interrompido. No celular, mantenha esta tela aberta e a tela ligada até terminar.",
                  progress: undefined,
                }
              : i
          )
        );
      }
    }
    } finally {
      document.removeEventListener("visibilitychange", onVisibility);
      await releaseScreenWakeLock(wake);
    }

    setFilaInfo(null);
    setLoading(false);
    if (okCount > 0) {
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
          <button type="button" className={btnClass} onClick={() => cameraFotoRef.current?.click()}>
            Tirar foto
          </button>
          <button type="button" className={btnClass} onClick={() => cameraVideoRef.current?.click()}>
            Gravar vídeo
          </button>
          <button type="button" className={btnClass} onClick={() => galeriaRef.current?.click()}>
            Da galeria
          </button>
        </div>
        <p className="mt-2 font-sans text-xs text-invite-olive/55">
          Sem limite de tamanho na VPS. Em vídeos grandes, mantenha esta tela aberta e a tela
          ligada até terminar (o celular cancela envio em segundo plano).
        </p>

        <input
          ref={cameraFotoRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={onInputChange}
        />
        <input
          ref={cameraVideoRef}
          type="file"
          accept="video/*"
          capture="environment"
          className="sr-only"
          onChange={onInputChange}
        />
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
            <p className={`${presentesLabelClass} !mb-0`}>
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
                    <img src={item.previewUrl} alt="" className="h-full w-full object-cover" />
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
                    {item.status === "preparing" && " · preparando…"}
                    {item.status === "uploading" &&
                      ` · enviando ${item.progress ?? 0}%` +
                        (item.loadedBytes != null && item.totalBytes
                          ? ` (${formatBytes(item.loadedBytes)} / ${formatBytes(item.totalBytes)})`
                          : "")}
                    {item.status === "saving" && " · salvando no álbum…"}
                    {item.status === "done" && " · enviado"}
                    {item.status === "error" && ` · ${item.erro || "erro"}`}
                  </p>
                  {(item.status === "preparing" ||
                    item.status === "uploading" ||
                    item.status === "saving") && (
                    <div
                      className="mt-2 h-1.5 w-full overflow-hidden bg-invite-olive/15"
                      role="progressbar"
                      aria-valuenow={item.status === "preparing" ? 0 : item.progress ?? 0}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label="Progresso do envio"
                    >
                      <div
                        className={`h-full bg-invite-olive transition-[width] duration-200 ease-out ${
                          item.status === "saving" ? "animate-pulse" : ""
                        }`}
                        style={{
                          width:
                            item.status === "preparing"
                              ? "8%"
                              : `${Math.max(item.progress ?? 0, 2)}%`,
                        }}
                      />
                    </div>
                  )}
                </div>

                {item.status !== "uploading" &&
                  item.status !== "preparing" &&
                  item.status !== "saving" && (
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

      {loading && (
        <div className="border border-amber-700/25 bg-amber-50/90 px-4 py-3" role="status">
          <p className="font-sans text-sm text-amber-950/90">
            Envio em andamento
            {filaInfo ? ` (${filaInfo.atual}/${filaInfo.total})` : ""}. Deixe esta página aberta
            e a tela ligada — se bloquear ou trocar de app, o navegador costuma cancelar.
          </p>
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

      <button type="submit" disabled={loading || pendentes === 0} className={presentesBtnPrimary}>
        {loading && filaInfo
          ? `Enviando ${filaInfo.atual}/${filaInfo.total}…`
          : loading
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
