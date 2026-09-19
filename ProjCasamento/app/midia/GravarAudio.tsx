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
          Seu nome{" "}
          <span className="font-normal normal-case tracking-normal text-invite-olive/45">(opcional)</span>
        </label>
        <input
          id="audio-nome"
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex.: João"
          className={presentesFieldClass}
        />
      </div>

      <div className="flex flex-col items-center border border-invite-olive/25 bg-white/50 px-4 py-7">
        {!recording && !audioBlob && (
          <button
            type="button"
            onClick={startRecording}
            className="group flex flex-col items-center gap-3"
            aria-label="Começar gravação"
          >
            <span
              className="flex h-20 w-20 items-center justify-center rounded-full bg-invite-olive text-white transition-transform duration-200 group-hover:scale-105 group-active:scale-95 sm:h-24 sm:w-24"
              style={{ animation: "midiaRecPulse 2.4s ease-out infinite" }}
            >
              <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2Z" />
              </svg>
            </span>
            <span className="font-sans text-sm font-medium text-invite-olive">Toque para gravar</span>
          </button>
        )}

        {recording && (
          <div className="flex flex-col items-center gap-4">
            <div className="relative flex h-20 w-20 items-center justify-center sm:h-24 sm:w-24">
              <span className="absolute inset-0 animate-ping rounded-full bg-red-500/25" />
              <span className="relative flex h-full w-full items-center justify-center rounded-full bg-red-600 text-white">
                <span className="h-6 w-6 rounded-sm bg-white" />
              </span>
            </div>
            <div className="text-center">
              <p className="font-sans text-sm font-medium text-invite-olive">Gravando</p>
              <p className="mt-1 font-sans text-2xl tabular-nums text-invite-olive">{tempo}</p>
              <p className="mt-0.5 font-sans text-xs text-invite-olive/50">máx. 10:00</p>
            </div>
            <button
              type="button"
              onClick={stopRecording}
              className="border border-red-600/80 bg-red-600 px-6 py-2.5 font-sans text-sm font-medium text-white"
            >
              Parar
            </button>
          </div>
        )}

        {audioBlob && !recording && audioUrl && (
          <div className="w-full max-w-md space-y-3 text-center">
            <audio src={audioUrl} controls className="mx-auto w-full" />
            <p className="font-sans text-xs text-invite-olive/55">
              {tempo} · {formatBytes(audioBlob.size)}
            </p>
            <button
              type="button"
              onClick={() => {
                setAudioBlob(null);
                setDuration(0);
              }}
              className={presentesBtnOutline}
            >
              Gravar de novo
            </button>
          </div>
        )}
      </div>

      {loading && (
        <div>
          <p className="mb-1.5 font-sans text-xs text-invite-olive/65">
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
        <div className="bg-red-50/90 px-3.5 py-3" role="alert">
          <p className="font-sans text-sm text-red-800">{erro}</p>
        </div>
      )}
      {sucesso && (
        <div className="bg-invite-olive/10 px-3.5 py-3" role="status">
          <p className="font-sans text-sm font-medium text-invite-olive">Áudio enviado</p>
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
