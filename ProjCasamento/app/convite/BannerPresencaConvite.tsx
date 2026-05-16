"use client";

import { useEffect, useState } from "react";
import AvisoPresencaConvite from "./AvisoPresencaConvite";

type Props = {
  token: string;
  respondeuInicial: boolean;
  confirmadoInicial: boolean;
};

export default function BannerPresencaConvite({
  token,
  respondeuInicial,
  confirmadoInicial,
}: Props) {
  const [respondeu, setRespondeu] = useState(respondeuInicial);
  const [confirmado, setConfirmado] = useState(confirmadoInicial);

  useEffect(() => {
    let ativo = true;
    fetch(`/api/status-presenca?token=${encodeURIComponent(token)}`, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!ativo || !data) return;
        setRespondeu(Boolean(data.respondeu));
        setConfirmado(Boolean(data.confirmado));
      })
      .catch(() => {});
    return () => {
      ativo = false;
    };
  }, [token]);

  if (!respondeu) return null;

  return (
    <div className="mb-10">
      <AvisoPresencaConvite token={token} confirmado={confirmado} />
    </div>
  );
}
