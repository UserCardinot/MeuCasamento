"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatAcompanhantesLista } from "@/lib/acompanhantes";
import SelecaoAcompanhantes from "./SelecaoAcompanhantes";

type Props = {
  token: string;
  confirmadoInicial?: "sim" | "nao";
  mensagemInicial?: string;
  acompanhantesConvite?: string[];
  acompanhantesSelecionadosInicial?: string[];
};

const labelClass =
  "font-invite-caps mb-2.5 block text-[0.68rem] font-medium uppercase tracking-[0.16em] text-invite-olive sm:text-xs md:mb-3 md:text-sm";

const fieldClass =
  "w-full border border-invite-olive/25 bg-white/80 px-4 py-3.5 font-sans text-sm text-invite-olive placeholder:text-invite-olive/40 transition-colors focus:border-invite-olive/50 focus:outline-none focus:ring-2 focus:ring-invite-olive/20 md:px-5 md:py-4 md:text-base";

export default function FormConfirmacao({
  token,
  confirmadoInicial,
  mensagemInicial,
  acompanhantesConvite = [],
  acompanhantesSelecionadosInicial = [],
}: Props) {
  const router = useRouter();
  const [confirmado, setConfirmado] = useState<"sim" | "nao" | "">(confirmadoInicial ?? "");
  const [acompanhantesLista, setAcompanhantesLista] = useState<string[]>(acompanhantesSelecionadosInicial);
  const [mensagem, setMensagem] = useState(mensagemInicial ?? "");
  const [mensagemRascunho, setMensagemRascunho] = useState("");
  const [modalRecadoAberto, setModalRecadoAberto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    if (!modalRecadoAberto) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setModalRecadoAberto(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalRecadoAberto]);

  function abrirModalRecado() {
    setMensagemRascunho(mensagem);
    setModalRecadoAberto(true);
  }

  function salvarRecado() {
    setMensagem(mensagemRascunho.trim());
    setModalRecadoAberto(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!confirmado) {
      setErro("Selecione se você virá ou não.");
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
          mensagem: mensagem.trim() || undefined,
          nomesAcompanhantes:
            confirmado === "sim" ? formatAcompanhantesLista(acompanhantesLista) || undefined : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.erro || "Erro ao confirmar. Tente novamente.");
        return;
      }

      setSucesso(true);
      setTimeout(() => {
        window.location.href = `/convite?token=${encodeURIComponent(token)}`;
      }, 2200);
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (sucesso) {
    return (
      <div className="border border-invite-olive/30 bg-white/60 px-6 py-10 text-center md:px-10 md:py-14">
        <span
          className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border-2 border-invite-olive text-invite-olive md:mb-5 md:h-14 md:w-14"
          aria-hidden
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 12.5l4 4 8-9"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <p className="font-heading text-xl italic text-invite-olive md:text-2xl">Obrigado!</p>
        <p className="font-invite-caps mt-3 text-[0.72rem] font-medium uppercase tracking-[0.14em] text-invite-olive/90 md:text-sm">
          Sua resposta foi registrada
        </p>
        <Link
          href={`/convite?token=${encodeURIComponent(token)}`}
          className="font-invite-caps mt-8 inline-block text-[0.68rem] font-medium uppercase tracking-[0.18em] text-invite-olive/80 underline-offset-4 hover:text-invite-olive hover:underline"
        >
          Voltar ao convite
        </Link>
      </div>
    );
  }

  const opcaoClass = (ativo: boolean) =>
    `font-invite-caps py-4 px-4 text-[0.75rem] font-semibold uppercase tracking-[0.14em] transition-all sm:text-xs md:py-5 md:px-6 md:text-sm ${
      ativo
        ? "border-invite-olive bg-invite-olive text-white shadow-sm"
        : "border-invite-olive/30 bg-white/70 text-invite-olive hover:border-invite-olive/50"
    }`;

  return (
    <>
      <form onSubmit={handleSubmit} className="mx-auto w-full max-w-2xl space-y-7 md:max-w-none md:space-y-9 lg:space-y-10">
        <div>
          <label className={labelClass}>Você confirma presença? *</label>
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <button type="button" onClick={() => setConfirmado("sim")} className={`border ${opcaoClass(confirmado === "sim")}`}>
              Sim, estarei lá
            </button>
            <button type="button" onClick={() => setConfirmado("nao")} className={`border ${opcaoClass(confirmado === "nao")}`}>
              Não poderei ir
            </button>
          </div>
        </div>

        {confirmado === "sim" && (
          <SelecaoAcompanhantes
            sugestoes={acompanhantesConvite}
            selecionados={acompanhantesLista}
            onChange={setAcompanhantesLista}
          />
        )}

        <div className="flex flex-col items-center text-center">
          <p className={labelClass}>Recado para os noivos</p>
          <p className="font-sans mb-4 text-xs normal-case tracking-normal text-invite-olive/55 md:text-sm">
            Opcional
          </p>
          <button
            type="button"
            onClick={abrirModalRecado}
            className="font-invite-caps border border-invite-olive/35 bg-white/70 px-8 py-3.5 text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-invite-olive transition-all hover:border-invite-olive/55 hover:bg-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-invite-olive sm:text-xs md:px-10 md:py-4 md:text-sm"
          >
            {mensagem ? "Editar recado" : "Deixar um recado"}
          </button>
          {mensagem && (
            <p className="font-sans mt-3 max-w-md line-clamp-2 text-sm italic text-invite-olive/75">
              &ldquo;{mensagem}&rdquo;
            </p>
          )}
        </div>

        {erro && (
          <p className="font-sans text-sm text-red-700/90 md:text-base" role="alert">
            {erro}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="font-invite-caps w-full border-2 border-invite-olive bg-invite-olive py-4 text-[0.8rem] font-semibold uppercase tracking-[0.16em] text-white shadow-sm transition-transform hover:scale-[1.01] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-invite-olive disabled:cursor-not-allowed disabled:opacity-50 sm:text-xs md:py-5 md:text-sm"
        >
          {loading ? "Enviando..." : confirmadoInicial ? "Atualizar confirmação" : "Enviar confirmação"}
        </button>
      </form>

      {modalRecadoAberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-recado-titulo"
        >
          <button
            type="button"
            className="absolute inset-0 bg-invite-olive/25 backdrop-blur-[2px]"
            aria-label="Fechar"
            onClick={() => setModalRecadoAberto(false)}
          />
          <div className="relative z-10 w-full max-w-lg border border-invite-olive/40 bg-invite-cream px-6 py-8 shadow-lg sm:px-8 sm:py-10">
            <h2 id="modal-recado-titulo" className="font-heading text-center text-xl italic text-invite-olive sm:text-2xl">
              Recado para os noivos
            </h2>
            <p className="font-sans mt-2 text-center text-sm text-invite-olive/65">
              Deixe uma mensagem carinhosa (opcional)
            </p>
            <label htmlFor="mensagem" className="sr-only">
              Mensagem
            </label>
            <textarea
              id="mensagem"
              value={mensagemRascunho}
              onChange={(e) => setMensagemRascunho(e.target.value)}
              placeholder="Escreva aqui..."
              rows={5}
              autoFocus
              className={`${fieldClass} mt-6 resize-none`}
            />
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setModalRecadoAberto(false)}
                className="font-invite-caps border border-invite-olive/30 bg-white/70 py-3.5 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-invite-olive transition-colors hover:border-invite-olive/50 sm:text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={salvarRecado}
                className="font-invite-caps border-2 border-invite-olive bg-invite-olive py-3.5 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-white transition-transform hover:scale-[1.01] sm:text-xs"
              >
                Salvar recado
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
