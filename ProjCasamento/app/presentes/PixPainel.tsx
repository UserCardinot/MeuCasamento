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

export default function PixPainel({ token, presentesNomes, totalSugerido }: Props) {
  const [loading, setLoading] = useState(true);
  const [pix, setPix] = useState<{ qrDataUrl: string; chave: string | null } | null>(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;
    setLoading(true);
    setErro("");
    fetch("/api/pix-info", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!ativo) return;
        if (!data.configurado) {
          setPix(null);
          setErro("Pix ainda não configurado pelos noivos.");
          return;
        }
        setPix({ qrDataUrl: data.qrDataUrl, chave: data.chave ?? null });
      })
      .catch(() => {
        if (ativo) setErro("Não foi possível carregar os dados do Pix.");
      })
      .finally(() => {
        if (ativo) setLoading(false);
      });
    return () => {
      ativo = false;
    };
  }, []);

  if (loading) {
    return (
      <p className="font-sans animate-pulse py-8 text-center text-sm text-invite-olive/60">
        Carregando Pix...
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

  return (
    <div className="space-y-8">
      <div>
        <p className="font-invite-caps mb-4 text-[0.68rem] font-medium uppercase tracking-[0.16em] text-invite-olive/80">
          1. Pague pelo Pix
        </p>
        {totalSugerido != null && (
          <p className="font-sans mb-4 text-sm text-invite-olive/80">
            Valor sugerido (soma dos itens): R$ {formatPrecoBRL(totalSugerido)}
          </p>
        )}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className={`${presentesCard} mx-auto shrink-0 p-4 sm:mx-0`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={pix.qrDataUrl} alt="QR Code Pix" className="h-52 w-52" />
          </div>
          <div className="min-w-0 flex-1 space-y-4">
            <p className="font-sans text-sm leading-relaxed text-invite-olive/80">
              Abra o app do seu banco, escaneie o QR Code ou use a chave abaixo.
            </p>
            {pix.chave && (
              <div className="space-y-2">
                <p className="font-invite-caps text-[0.65rem] font-medium uppercase tracking-[0.14em] text-invite-olive/70">
                  Chave Pix
                </p>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
                  <code className="flex-1 break-all border border-invite-olive/20 bg-white/80 px-3 py-2.5 font-sans text-xs text-invite-olive">
                    {pix.chave}
                  </code>
                  <CopiarChave chave={pix.chave} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <FormPix token={token} presentesNomes={presentesNomes} totalSugerido={totalSugerido} />
    </div>
  );
}
