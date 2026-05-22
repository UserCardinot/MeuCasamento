"use client";

import { useMemo, useState } from "react";
import { formatPrecoBRL, somaPrecosCatalogo } from "@/lib/presentes-checkout";
import PixPainel from "./PixPainel";
import AvisoCartaoTesteMP from "./AvisoCartaoTesteMP";
import FormMercadoPago from "./FormMercadoPago";

type Presente = { nome: string; preco: string };

type MetodoPagamento = "pix" | "cartao" | "";

type Props = {
  token: string;
  presentes: Presente[];
};

function opcaoMetodoClass(ativo: boolean) {
  return `font-invite-caps flex flex-1 items-center justify-center gap-2 border py-4 px-3 text-[0.72rem] font-semibold uppercase tracking-[0.12em] transition-all sm:text-xs md:py-5 ${
    ativo
      ? "border-invite-olive bg-invite-olive text-white shadow-sm"
      : "border-invite-olive/30 bg-white/70 text-invite-olive hover:border-invite-olive/50"
  }`;
}

function IconePix() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2L4 6v12l8 4 8-4V6l-8-4z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M12 12l8-4M12 12v8M12 12L4 8" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function IconeCartao() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2 10h20" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export default function PagamentoPresente({ token, presentes }: Props) {
  const [metodo, setMetodo] = useState<MetodoPagamento>("");
  const nomes = useMemo(() => presentes.map((p) => p.nome), [presentes]);
  const totalSugerido = useMemo(() => somaPrecosCatalogo(presentes), [presentes]);

  return (
    <div className="space-y-8">
      <div className="text-center sm:text-left">
        <p className="font-invite-caps text-[0.68rem] font-medium uppercase tracking-[0.2em] text-invite-olive/75">
          Como deseja pagar?
        </p>
        <h2 className="font-heading mt-2 text-xl italic text-invite-olive sm:text-2xl">
          {presentes.length === 1 ? presentes[0]!.nome : `${presentes.length} presentes`}
        </h2>
        <ul className="font-sans mt-3 space-y-1 text-sm text-invite-olive/85">
          {presentes.map((p) => (
            <li key={p.nome}>
              {p.nome}
              {p.preco ? ` — R$ ${p.preco.replace(".", ",")}` : ""}
            </li>
          ))}
        </ul>
        {totalSugerido != null && (
          <p className="font-invite-caps mt-3 text-[0.8rem] font-semibold uppercase tracking-[0.14em] text-invite-olive/85">
            Total sugerido: R$ {formatPrecoBRL(totalSugerido)}
          </p>
        )}
      </div>

      <div
        className="grid grid-cols-2 gap-3"
        role="group"
        aria-label="Forma de pagamento"
      >
        <button
          type="button"
          onClick={() => setMetodo("pix")}
          className={opcaoMetodoClass(metodo === "pix")}
          aria-pressed={metodo === "pix"}
        >
          <IconePix />
          Pix
        </button>
        <button
          type="button"
          onClick={() => setMetodo("cartao")}
          className={opcaoMetodoClass(metodo === "cartao")}
          aria-pressed={metodo === "cartao"}
        >
          <IconeCartao />
          Cartão
        </button>
      </div>

      {metodo === "" && (
        <p className="font-sans text-center text-sm text-invite-olive/55">
          Escolha Pix ou cartão de crédito para continuar.
        </p>
      )}

      {metodo === "pix" && (
        <PixPainel
          token={token}
          presentesNomes={nomes}
          totalSugerido={totalSugerido}
        />
      )}

      {metodo === "cartao" && (
        <div className="space-y-5 border-t border-invite-olive/20 pt-8">
          <p className="font-sans text-sm leading-relaxed text-invite-olive/75">
            Você será direcionado ao checkout do Mercado Pago. No cartão, o total inclui uma taxa
            estimada do Mercado Pago (além do valor do presente na lista). No Pix, vale o valor da lista.
          </p>
          <AvisoCartaoTesteMP />
          <FormMercadoPago token={token} presentesNomes={nomes} totalSugerido={totalSugerido} />
        </div>
      )}
    </div>
  );
}
