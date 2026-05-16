"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Props = {
  token: string;
  mpStatus: string | undefined;
};

export default function ConfirmarRetornoMP({ token, mpStatus }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mensagem, setMensagem] = useState<string | null>(null);

  useEffect(() => {
    const statusParam = searchParams.get("status")?.trim();
    if (mpStatus !== "success" && statusParam !== "approved") return;

    const paymentId =
      searchParams.get("payment_id")?.trim() || searchParams.get("collection_id")?.trim();
    const externalReference = searchParams.get("external_reference")?.trim();
    const status = searchParams.get("status")?.trim();

    if (!paymentId && !externalReference) {
      setMensagem(
        status === "approved"
          ? "Pagamento aprovado. Se o presente não aparecer no histórico, recarregue em alguns segundos."
          : null
      );
      return;
    }

    let cancelado = false;

    (async () => {
      try {
        const res = await fetch("/api/mercadopago/confirmar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            payment_id: paymentId || undefined,
            external_reference: externalReference || undefined,
          }),
        });
        const data = await res.json();
        if (cancelado) return;

        if (res.ok && data.sucesso) {
          setMensagem(
            data.jaRegistrado
              ? "Contribuição já estava registrada. Obrigado!"
              : "Contribuição registrada com sucesso. Obrigado!"
          );
          router.refresh();
          return;
        }

        setMensagem(data.erro || "Não foi possível registrar automaticamente. Avise os noivos com o comprovante.");
      } catch {
        if (!cancelado) {
          setMensagem("Erro de conexão ao registrar. Recarregue a página ou avise os noivos.");
        }
      }
    })();

    return () => {
      cancelado = true;
    };
  }, [mpStatus, searchParams, token, router]);

  const statusParam = searchParams.get("status");
  if (!mensagem || (mpStatus !== "success" && statusParam !== "approved")) return null;

  return (
    <p className="mt-2 font-sans text-sm font-medium">{mensagem}</p>
  );
}
