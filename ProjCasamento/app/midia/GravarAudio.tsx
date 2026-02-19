"use client";

import { useState, useRef, useEffect } from "react";

type Props = { eventToken: string };

const MAX_DURATION_MS = 60 * 1000; // 1 minuto
const MAX_SIZE_MB = 5;

export default function GravarAudio({ eventToken }: Props) {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);
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
    if (audioBlob.size > MAX_SIZE_MB * 1024 * 1024) {
      setErro(`Áudio muito grande. Máximo ${MAX_SIZE_MB}MB.`);
      return;
    }

    setErro("");
    setLoading(true);
    setSucesso(false);

    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "audio.webm");
      formData.append("tipo", "audio");
      formData.append("eventToken", eventToken);
      if (nome.trim()) formData.append("nome", nome.trim());

      const res = await fetch("/api/enviar-midia", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.erro || "Erro ao enviar. Tente novamente.");
        return;
      }

      setSucesso(true);
      setAudioBlob(null);
      setNome("");
      setDuration(0);
    } catch {
      setErro("Erro de conexão. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">
          Seu nome (opcional)
        </label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex: João"
          className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-casamento-verde focus:border-casamento-verde"
        />
      </div>

      <div>
        <p className="text-sm text-stone-600 mb-2">
          Máximo 1 minuto. Clique em gravar e fale sua mensagem.
        </p>
        {!recording && !audioBlob && (
          <button
            type="button"
            onClick={startRecording}
            className="px-6 py-3 bg-casamento-verde text-white font-medium rounded-lg hover:opacity-90"
          >
            🎙️ Gravar
          </button>
        )}
        {recording && (
          <div className="flex items-center gap-4">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <span className="text-stone-600">
              {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, "0")} / 1:00
            </span>
            <button
              type="button"
              onClick={stopRecording}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Parar
            </button>
          </div>
        )}
        {audioBlob && !recording && (
          <div className="space-y-2">
            <audio
              src={URL.createObjectURL(audioBlob)}
              controls
              className="w-full max-w-md"
            />
            <button
              type="button"
              onClick={() => { setAudioBlob(null); setDuration(0); }}
              className="text-sm text-stone-500 hover:text-stone-700"
            >
              Gravar de novo
            </button>
          </div>
        )}
      </div>

      {erro && (
        <div className="space-y-2">
          <p className="text-red-600 text-sm">{erro}</p>
          <p className="text-stone-500 text-sm">
            Verifique sua conexão e tente novamente.
          </p>
        </div>
      )}
      {sucesso && (
        <p className="text-casamento-verde font-medium">✓ Áudio enviado com sucesso!</p>
      )}

      <button
        type="submit"
        disabled={loading || !audioBlob}
        className="w-full py-3 bg-casamento-verde text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {loading ? "Enviando..." : "Enviar áudio"}
      </button>
    </form>
  );
}
