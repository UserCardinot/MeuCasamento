"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Props = { token: string };

export default function FormConfirmacao({ token }: Props) {
  const router = useRouter();
  const [telefone, setTelefone] = useState("");
  const [confirmado, setConfirmado] = useState<"sim" | "nao" | "">("");
  const [mensagem, setMensagem] = useState("");
  const [nomesAcompanhantes, setNomesAcompanhantes] = useState("");
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
          mensagem: mensagem.trim() || undefined,
          nomesAcompanhantes: nomesAcompanhantes.trim() || undefined,
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
      <div className="bg-white rounded-2xl shadow-sm py-10 px-8 text-center flex flex-col items-center gap-3">
        <span className="text-casamento-oliva-escuro text-2xl" aria-hidden>✓</span>
        <p className="font-sans font-medium text-stone-800">Presença confirmada com sucesso!</p>
        <Link
          href={`/convite?token=${token}`}
          className="font-sans text-sm text-casamento-oliva-escuro hover:underline mt-4"
        >
          Voltar ao convite
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <label className="block font-sans text-sm font-medium text-stone-700 mb-3">
          Você confirma presença? *
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setConfirmado("sim")}
            className={`py-4 px-6 rounded-2xl font-sans font-medium transition-all duration-200 ${
              confirmado === "sim"
                ? "bg-casamento-oliva-escuro text-white shadow"
                : "bg-white text-stone-600 border border-stone-200 hover:border-stone-300"
            }`}
          >
            Sim
          </button>
          <button
            type="button"
            onClick={() => setConfirmado("nao")}
            className={`py-4 px-6 rounded-2xl font-sans font-medium transition-all duration-200 ${
              confirmado === "nao"
                ? "bg-casamento-oliva-escuro text-white shadow"
                : "bg-white text-stone-600 border border-stone-200 hover:border-stone-300"
            }`}
          >
            Não
          </button>
        </div>
      </div>

      <div>
        <label className="block font-sans text-sm font-medium text-stone-700 mb-2">
          Telefone <span className="text-stone-400 font-normal">(opcional)</span>
        </label>
        <input
          type="tel"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          placeholder="(11) 99999-9999"
          className="w-full px-5 py-4 border border-stone-200 rounded-2xl bg-white focus:ring-2 focus:ring-casamento-oliva focus:border-transparent placeholder:text-stone-400 transition-all"
        />
      </div>

      <div>
        <label className="block font-sans text-sm font-medium text-stone-700 mb-2">
          Nomes dos acompanhantes <span className="text-stone-400 font-normal">(opcional)</span>
        </label>
        <input
          type="text"
          value={nomesAcompanhantes}
          onChange={(e) => setNomesAcompanhantes(e.target.value)}
          placeholder="Ex: Maria, João"
          className="w-full px-5 py-4 border border-stone-200 rounded-2xl bg-white focus:ring-2 focus:ring-casamento-oliva focus:border-transparent placeholder:text-stone-400 transition-all"
        />
      </div>

      <div>
        <label className="block font-sans text-sm font-medium text-stone-700 mb-2">
          Recado para os noivos <span className="text-stone-400 font-normal">(opcional)</span>
        </label>
        <textarea
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          placeholder="Deixe uma mensagem..."
          rows={4}
          className="w-full px-5 py-4 border border-stone-200 rounded-2xl bg-white focus:ring-2 focus:ring-casamento-oliva focus:border-transparent placeholder:text-stone-400 transition-all resize-none"
        />
      </div>

      {erro && (
        <div className="space-y-1">
          <p className="font-sans text-red-600 text-sm">{erro}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 px-8 bg-casamento-oliva-escuro text-white font-sans font-medium rounded-2xl hover:bg-casamento-oliva disabled:opacity-50 transition-all duration-200 shadow-sm hover:shadow focus:ring-2 focus:ring-casamento-oliva focus:ring-offset-2 focus:outline-none"
      >
        {loading ? "Enviando..." : "Confirmar"}
      </button>
    </form>
  );
}
