"use client";

import { useEffect, useState } from "react";
import { formatPrecoBRL } from "@/lib/presentes-checkout";
import CopiarChave from "./CopiarChave";
import FormPix from "./FormPix";
import { presentesCard } from "./presentesTheme";

type Props = {
  token: string;
  presentesNomes: string[];
  totalSugerido: number | null;
};

type PixDados = {
  qrDataUrl: string;
  chave: string | null;
  copiaCola?: string;
  valor?: string;
  valorFixo?: boolean;
};

export default function PixPainel({ token, presentesNomes, totalSugerido }: Props) {
  const [loading, setLoading] = useState(true);
  const [pix, setPix] = useState<PixDados | null>(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      setLoading(true);
      setErro("");
      setPix(null);

      if (totalSugerido == null || totalSugerido <= 0) {
        if (ativo) {
          setErro(
            "Os itens do carrinho precisam ter preço na lista para gerar o Pix com valor fixo. Escolha outros presentes ou pague com cartão."
          );
          setLoading(false);
        }
        return;
      }

      try {
        const res = await fetch("/api/pix-info", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ valor: totalSugerido }),
          cache: "no-store",
        });
        const data = await res.json();
        if (!ativo) return;

        if (!data.configurado) {
          setErro("Pix ainda não configurado pelos noivos.");
          return;
        }
        if (!res.ok) {
          setErro(data.erro || "Não foi possível gerar o Pix.");
          return;
        }

        setPix({
          qrDataUrl: data.qrDataUrl,
          chave: data.chave ?? null,
          copiaCola: data.copiaCola,
          valor: data.valor,
          valorFixo: data.valorFixo,
        });
      } catch {
        if (ativo) setErro("Não foi possível carregar os dados do Pix.");
      } finally {
        if (ativo) setLoading(false);
      }
    }

    carregar();
    return () => {
      ativo = false;
    };
  }, [totalSugerido]);

  if (loading) {
    return (
      <p className="font-sans animate-pulse py-8 text-center text-sm text-invite-olive/60">
        Gerando Pix com o valor do carrinho…
      </p>
    );
  }

  if (erro || !pix) {
    return (
      <div className={`${presentesCard} p-5 font-sans text-sm text-invite-olive/85`}>
        <p>{erro || "Pix indisponível no momento."}</p>
      </div>
    );
  }

  const valorExibicao =
    pix.valor != null ? formatPrecoBRL(Number(pix.valor)) : totalSugerido != null ? formatPrecoBRL(totalSugerido) : null;

  return (
    <div className="space-y-8">
      <div>
        <p className="font-invite-caps mb-4 text-[0.68rem] font-medium uppercase tracking-[0.16em] text-invite-olive/80">
          1. Pague pelo Pix
        </p>
        {valorExibicao != null && (
          <p className="font-invite-caps mb-2 text-[0.8rem] font-semibold uppercase tracking-[0.12em] text-invite-olive">
            Valor do pagamento: R$ {valorExibicao}
          </p>
        )}
        <p className="font-sans mb-4 text-sm leading-relaxed text-invite-olive/80">
          O QR Code já vem com esse valor. No app do banco, confira o total antes de confirmar — não será necessário
          digitar outro valor.
        </p>
        <p className="font-sans text-sm leading-relaxed text-invite-olive/80">
          Abra o app do seu banco, escaneie o QR Code ou use o código copia e cola.
        </p>

        <div className={`${presentesCard} mx-auto mt-4 w-fit p-4`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={pix.qrDataUrl} alt="QR Code Pix" className="h-48 w-48 sm:h-52 sm:w-52" />
        </div>

        {pix.copiaCola && (
          <div className="mt-5 space-y-2">
            <p className="font-invite-caps text-[0.65rem] font-medium uppercase tracking-[0.14em] text-invite-olive/70">
              Pix copia e cola
            </p>
            <pre className="max-h-32 w-full min-w-0 overflow-x-auto overflow-y-auto whitespace-pre-wrap break-all rounded-sm border border-invite-olive/25 bg-white p-3 font-mono text-[0.7rem] leading-relaxed text-invite-olive">
              {pix.copiaCola}
            </pre>
            <CopiarChave chave={pix.copiaCola} rotulo="Copiar código Pix" />
          </div>
        )}

        {pix.chave && (
          <div className="mt-4 space-y-2">
            <p className="font-invite-caps text-[0.65rem] font-medium uppercase tracking-[0.14em] text-invite-olive/70">
              Chave Pix (alternativa)
            </p>
            <p className="w-full break-all rounded-sm border border-invite-olive/25 bg-white px-3 py-2.5 font-sans text-sm text-invite-olive">
              {pix.chave}
            </p>
            <CopiarChave chave={pix.chave} rotulo="Copiar chave" />
          </div>
        )}
      </div>

      <FormPix token={token} presentesNomes={presentesNomes} totalSugerido={totalSugerido} />
    </div>
  );
}
