"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = { token: string };

export default function FormConfirmacao({ token }: Props) {
  const router = useRouter();
  const [telefone, setTelefone] = useState("");
  const [confirmado, setConfirmado] = useState<"sim" | "nao" | "">("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!confirmado) {
      setErro("Selecione Sim ou Não.");
      return;
    }
    setErro("");
    setLoading(true);

    try {
      const res = await fetch("/api/confirmar-presenca", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          confirmado: confirmado === "sim",
          telefone: telefone.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.erro || "Erro ao confirmar. Tente novamente.");
        return;
      }

      setSucesso(true);
      setTimeout(() => router.push(`/convite?token=${token}`), 2000);
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (sucesso) {
    return (
      <div className="bg-casamento-sage border border-casamento-verde/50 text-stone-800 px-4 py-3 rounded-lg text-center">
        ✓ Presença confirmada com sucesso!
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-2">
          Você confirma presença? *
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="confirmado"
              value="sim"
              checked={confirmado === "sim"}
              onChange={() => setConfirmado("sim")}
            />
            <span>Sim</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="confirmado"
              value="nao"
              checked={confirmado === "nao"}
              onChange={() => setConfirmado("nao")}
            />
            <span>Não</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">
          Telefone (opcional)
        </label>
        <input
          type="tel"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          placeholder="(11) 99999-9999"
          className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-casamento-verde focus:border-casamento-verde"
        />
      </div>

      {erro && (
        <div className="space-y-1">
          <p className="text-red-600 text-sm">{erro}</p>
          <p className="text-stone-500 text-xs">Verifique sua conexão e tente novamente.</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-casamento-verde text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50 transition"
      >
        {loading ? "Enviando..." : "Confirmar"}
      </button>
    </form>
  );
}
