"use client";

import { useState, useEffect, useCallback } from "react";
import CardRecadoMural from "./CardRecadoMural";
import ModalRecado from "./ModalRecado";
import {
  presentesBtnPrimary,
  presentesCard,
  presentesFieldClass,
  presentesLabelClass,
} from "../presentes/presentesTheme";

type Recado = { nome: string; mensagem: string; data: string };

const secaoTituloClass =
  "font-invite-caps text-[0.68rem] font-medium uppercase tracking-[0.18em] text-invite-olive/75";

export default function RecadosClient({ token }: { token: string }) {
  const [recados, setRecados] = useState<Recado[]>([]);
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [recadoAberto, setRecadoAberto] = useState<Recado | null>(null);

  const carregar = useCallback(() => {
    fetch(`/api/listar-recados?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.erro) setErro(data.erro);
        else setRecados(data.recados || []);
      })
      .catch(() => setErro("Erro ao carregar recados."))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const msg = mensagem.trim();
    if (!msg || msg.length > 500) {
      setErro("Mensagem obrigatória (máx. 500 caracteres).");
      return;
    }
    setErro("");
    setSucesso(false);
    setEnviando(true);
    try {
      const res = await fetch("/api/enviar-recado", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, mensagem: msg }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.erro || "Erro ao enviar.");
        return;
      }
      setMensagem("");
      setSucesso(true);
      carregar();
    } catch {
      setErro("Erro de conexão.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="text-center">
      <section className="border-b border-invite-olive/12 pb-8 md:pb-10" aria-labelledby="titulo-escrever-recado">
        <h2 id="titulo-escrever-recado" className={`${secaoTituloClass} mb-5`}>
          Escrever um recado
        </h2>

        <form onSubmit={handleSubmit} className="mx-auto w-full max-w-lg space-y-5 text-left">
          <div>
            <label htmlFor="mensagem-recado" className={`${presentesLabelClass} text-center`}>
              Sua mensagem
            </label>
            <textarea
              id="mensagem-recado"
              value={mensagem}
              onChange={(e) => {
                setMensagem(e.target.value);
                setSucesso(false);
              }}
              placeholder="Escreva aqui com carinho…"
              rows={5}
              maxLength={500}
              className={`${presentesFieldClass} resize-none`}
            />
            <p className="font-sans mt-2 text-right text-xs tabular-nums text-invite-olive/50">
              {mensagem.length}/500
            </p>
          </div>

          {erro && (
            <p className="font-sans text-sm leading-relaxed text-red-800/90" role="alert">
              {erro}
            </p>
          )}
          {sucesso && (
            <p
              className="border border-invite-olive/30 bg-invite-olive/10 px-4 py-3 font-sans text-sm leading-relaxed text-invite-olive"
              role="status"
            >
              Recado enviado com carinho. Obrigado!
            </p>
          )}

          <button
            type="submit"
            disabled={enviando || !mensagem.trim()}
            className={presentesBtnPrimary}
          >
            {enviando ? "Enviando…" : "Enviar recado"}
          </button>
        </form>
      </section>

      <section className="pt-8 md:pt-10" aria-labelledby="titulo-mural-recados">
        <div className="mb-6 text-center">
          <h2 id="titulo-mural-recados" className={secaoTituloClass}>
            Recados no mural
          </h2>
          {!loading && recados.length > 0 && (
            <p className="font-sans mt-2 text-xs text-invite-olive/55">
              {recados.length} {recados.length === 1 ? " mensagem" : " mensagens"}
            </p>
          )}
        </div>

        {loading ? (
          <p className="font-sans py-12 text-sm text-invite-olive/60">Carregando recados…</p>
        ) : recados.length === 0 ? (
          <p
            className={`${presentesCard} mx-auto max-w-lg border-dashed px-6 py-12 font-sans text-sm leading-relaxed text-invite-olive/75`}
          >
            Nenhum recado ainda. Seja o primeiro a escrever!
          </p>
        ) : (
          <div className="border border-invite-olive/15 bg-gradient-to-b from-white/40 to-invite-olive/[0.04] p-3 sm:p-4 md:p-5">
            <ul className="grid max-h-[min(58vh,36rem)] w-full grid-cols-1 gap-3 overflow-y-auto overscroll-y-contain p-0.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {[...recados].reverse().map((r, i) => (
                <li key={`${r.nome}-${r.data}-${i}`} className="flex min-h-[11rem]">
                  <CardRecadoMural
                    nome={r.nome}
                    data={r.data}
                    onClick={() => setRecadoAberto(r)}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <ModalRecado recado={recadoAberto} onClose={() => setRecadoAberto(null)} />
    </div>
  );
}
