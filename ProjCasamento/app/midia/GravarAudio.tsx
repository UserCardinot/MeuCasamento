"use client";

import { useEffect, useRef, useState } from "react";
import {
  presentesBtnOutline,
  presentesBtnPrimary,
  presentesFieldClass,
  presentesLabelClass,
} from "@/app/presentes/presentesTheme";
import {
  formatBytes,
  releaseScreenWakeLock,
  requestScreenWakeLock,
  uploadRawFileWithProgress,
} from "@/lib/upload-with-progress";

type Props = { eventToken: string };

const MAX_DURATION_MS = 10 * 60 * 1000; // 10 min — só para não gravar sem querer por horas

export default function GravarAudio({ eventToken }: Props) {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fase, setFase] = useState<"idle" | "uploading" | "saving">("idle");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!audioBlob) {
      setAudioUrl(null);
      return;
    }
    const url = URL.createObjectURL(audioBlob);
    setAudioUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [audioBlob]);

  async function startRecording() {
    setErro("");
    setAudioBlob(null);
    setSucesso(false);
    setDuration(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);

      timerRef.current = setInterval(() => {
        setDuration((d) => {
          if (d >= MAX_DURATION_MS / 1000 - 1) {
            stopRecording();
            return MAX_DURATION_MS / 1000;
          }
          return d + 1;
        });
      }, 1000);
    } catch {
      setErro("Não foi possível acessar o microfone.");
    }
  }

  function stopRecording() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!audioBlob) {
      setErro("Grave um áudio primeiro.");
      return;
    }

    setErro("");
    setLoading(true);
    setSucesso(false);
    setProgress(0);
    setFase("uploading");

    const wake = await requestScreenWakeLock();

    try {
      const formName = nome.trim() || "Anônimo";
      const { ok, data } = await uploadRawFileWithProgress(
        "/api/enviar-midia",
        audioBlob,
        {
          "x-raw-upload": "1",
          "x-event-token": eventToken,
          "x-tipo": "audio",
          "x-nome": encodeURIComponent(formName),
          "x-filename": "audio.webm",
          "x-mime": audioBlob.type || "audio/webm",
          "Content-Type": audioBlob.type || "audio/webm",
        },
        (p) => {
          setProgress(p.percent);
          if (p.percent >= 100) setFase("saving");
        }
      );

      if (!ok) {
        setErro(data.erro || "Erro ao enviar. Tente novamente.");
        return;
      }

      setSucesso(true);
      setAudioBlob(null);
      setNome("");
      setDuration(0);
    } catch {
      setErro(
        "Envio interrompido. Mantenha esta tela aberta e a tela ligada até terminar."
      );
    } finally {
      await releaseScreenWakeLock(wake);
      setLoading(false);
      setFase("idle");
      setProgress(0);
    }
  }

  const tempo = `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, "0")}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="audio-nome" className={presentesLabelClass}>
          Seu nome (opcional)
        </label>
        <input
          id="audio-nome"
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex: João"
          className={presentesFieldClass}
        />
      </div>

      <div className="border border-invite-olive/25 bg-white/50 px-5 py-8 text-center sm:px-8 sm:py-10">
        {!recording && !audioBlob && (
          <button type="button" onClick={startRecording} className={`${presentesBtnPrimary} max-w-xs`}>
            Começar gravação
          </button>
        )}

        {recording && (
          <div className="flex flex-col items-center gap-5">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-60" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
              </span>
              <span className="font-invite-caps text-sm tracking-[0.12em] text-invite-olive">
                Gravando {tempo} / 10:00
              </span>
            </div>
            <button
              type="button"
              onClick={stopRecording}
              className="font-invite-caps border-2 border-red-600/80 bg-red-600 px-8 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-white transition-transform hover:scale-[1.01]"
            >
              Parar
            </button>
          </div>
        )}

        {audioBlob && !recording && audioUrl && (
          <div className="space-y-4">
            <audio src={audioUrl} controls className="mx-auto w-full max-w-md" />
            <p className="font-sans text-xs text-invite-olive/55">{formatBytes(audioBlob.size)}</p>
            <button
              type="button"
              onClick={() => {
                setAudioBlob(null);
                setDuration(0);
              }}
              className={`${presentesBtnOutline} max-w-xs`}
            >
              Gravar de novo
            </button>
          </div>
        )}
      </div>

      {loading && (
        <div>
          <p className="mb-2 font-sans text-xs text-invite-olive/70">
            {fase === "saving" ? "Salvando no álbum…" : `Enviando ${progress}%`}
          </p>
          <div
            className="h-1.5 w-full overflow-hidden bg-invite-olive/15"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className={`h-full bg-invite-olive transition-[width] duration-200 ${
                fase === "saving" ? "animate-pulse" : ""
              }`}
              style={{ width: `${Math.max(progress, 2)}%` }}
            />
          </div>
        </div>
      )}

      {erro && (
        <div className="border border-red-300/50 bg-red-50/80 px-4 py-3" role="alert">
          <p className="font-sans text-sm text-red-800">{erro}</p>
        </div>
      )}
      {sucesso && (
        <div className="border border-invite-olive/30 bg-invite-olive/10 px-4 py-3" role="status">
          <p className="font-invite-caps text-[0.7rem] font-medium uppercase tracking-[0.14em] text-invite-olive">
            Áudio enviado com sucesso
          </p>
        </div>
      )}

      <button type="submit" disabled={loading || !audioBlob} className={presentesBtnPrimary}>
        {loading
          ? fase === "saving"
            ? "Salvando…"
            : `Enviando ${progress}%…`
          : "Enviar áudio"}
      </button>
    </form>
  );
}
