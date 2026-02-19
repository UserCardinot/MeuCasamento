"use client";

import { useState, useRef } from "react";

type Props = { eventToken: string };

const MAX_SIZE_MB = 10;
const MAX_BYTES = MAX_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export default function UploadFotos({ eventToken }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    setErro("");
    setSucesso(false);
    if (!f) {
      setFile(null);
      return;
    }
    if (!ALLOWED_TYPES.includes(f.type)) {
      setErro("Formato inválido. Use JPG, PNG, WebP ou GIF.");
      setFile(null);
      return;
    }
    if (f.size > MAX_BYTES) {
      setErro(`Arquivo muito grande. Máximo ${MAX_SIZE_MB}MB.`);
      setFile(null);
      return;
    }
    setFile(f);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setErro("Selecione uma foto.");
      return;
    }
    setErro("");
    setLoading(true);
    setSucesso(false);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("tipo", "foto");
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
      setFile(null);
      setNome("");
      if (inputRef.current) inputRef.current.value = "";
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
          placeholder="Ex: Maria"
          className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-casamento-verde focus:border-casamento-verde"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-2">
          Escolher foto (máx. {MAX_SIZE_MB}MB)
        </label>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          className="block w-full text-sm text-stone-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-casamento-verde file:text-white file:cursor-pointer hover:file:opacity-90"
        />
        {file && (
          <div className="mt-2 flex items-center gap-3">
            <img
              src={URL.createObjectURL(file)}
              alt="Preview"
              className="h-20 w-20 object-cover rounded border border-stone-200"
            />
            <span className="text-sm text-stone-600">{file.name}</span>
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
        <p className="text-casamento-verde font-medium">✓ Foto enviada com sucesso!</p>
      )}

      <button
        type="submit"
        disabled={loading || !file}
        className="w-full py-3 bg-casamento-verde text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {loading ? "Enviando..." : "Enviar foto"}
      </button>
    </form>
  );
}
