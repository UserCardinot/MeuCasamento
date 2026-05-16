"use client";

import { useEffect, useState } from "react";

const PAINEL_CONTAS_TESTE =
  "https://www.mercadopago.com.br/developers/panel/app";

export default function AvisoCartaoTesteMP() {
  const [sandbox, setSandbox] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/mercadopago/modo")
      .then((r) => r.json())
      .then((data: { sandbox?: boolean }) => {
        if (!cancelled) setSandbox(Boolean(data.sandbox));
      })
      .catch(() => {
        if (!cancelled) setSandbox(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (sandbox !== true) return null;

  return (
    <div className="rounded-sm border border-sky-800/20 bg-sky-50/90 px-3 py-3 font-sans text-xs leading-relaxed text-sky-950/90">
      <p className="font-semibold">Modo teste do Mercado Pago</p>
      <p className="mt-1">
        Confira se a barra de endereço começa com{" "}
        <span className="font-mono">sandbox.mercadopago.com.br</span> (não{" "}
        <span className="font-mono">www.mercadopago.com.br</span>).
      </p>
      <ol className="mt-2 list-decimal space-y-1 pl-4">
        <li>
          No painel MP:{" "}
          <a
            href={PAINEL_CONTAS_TESTE}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Suas integrações
          </a>{" "}
          → sua app → <strong>Contas de teste</strong> → <strong>Comprador</strong>. Anote usuário e
          senha.
        </li>
        <li>
          No checkout sandbox, se aparecer &quot;Entrar com Mercado Pago&quot;, use o{" "}
          <strong>comprador de teste</strong> (não sua conta real).
        </li>
        <li>
          Cartão Visa (oficial MP): <span className="font-mono">4235 6477 2802 5682</span> · Mastercard:{" "}
          <span className="font-mono">5031 4332 1540 6351</span>
        </li>
        <li>
          CVV <span className="font-mono">123</span> · Validade <span className="font-mono">11/30</span> ·
          Nome no cartão: <span className="font-mono">APRO</span> · CPF:{" "}
          <span className="font-mono">12345678909</span>
        </li>
      </ol>
      <p className="mt-2 text-sky-900/75">
        O cartão antigo <span className="font-mono">4509 … 3704</span> não é mais o da documentação atual
        e pode gerar erro.
      </p>
    </div>
  );
}
