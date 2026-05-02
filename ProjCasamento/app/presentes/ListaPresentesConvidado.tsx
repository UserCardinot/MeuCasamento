"use client";

import { useState } from "react";
import FormPix from "./FormPix";
import FormMercadoPago from "./FormMercadoPago";
import QrCodePix from "./QrCodePix";

type Presente = { nome: string; preco: string; url: string; imagem: string };

type Props = {
  token: string;
  catalog: Presente[];
  presenteRegistrado: { presente: string; valor?: string } | null;
};

export default function ListaPresentesConvidado({ token, catalog, presenteRegistrado }: Props) {
  const [presenteSelecionado, setPresenteSelecionado] = useState<Presente | null>(null);

  if (presenteRegistrado) {
    return (
      <div className="bg-white rounded-2xl shadow-sm py-6 px-8 mb-12 flex items-center gap-3 border border-stone-100">
        <span className="text-casamento-oliva-escuro text-xl" aria-hidden>✓</span>
        <div>
          <p className="font-sans font-medium text-stone-800">Você já registrou sua contribuição</p>
          <p className="font-sans text-stone-600 text-sm mt-0.5">
            {presenteRegistrado.presente}
            {presenteRegistrado.valor && ` – R$ ${presenteRegistrado.valor}`}
          </p>
        </div>
      </div>
    );
  }

  if (catalog.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-12 text-center text-stone-600">
        <p>Nenhum presente cadastrado no momento.</p>
        <p className="text-sm mt-2">Os noivos em breve disponibilizarão a lista.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {catalog.map((p, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow transition-all duration-200"
          >
              {p.imagem && (
                <a
                  href={p.url || p.imagem}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block aspect-video bg-stone-100"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.imagem}
                    alt={p.nome}
                    className="w-full h-full object-cover"
                  />
                </a>
              )}
              <div className="p-5">
                <h3 className="font-heading font-medium text-stone-800 text-lg">{p.nome}</h3>
                {p.preco && (
                  <p className="font-sans text-casamento-oliva-escuro font-semibold mt-2">
                    R$ {p.preco.replace(".", ",")}
                  </p>
                )}
                {p.url && (
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-sans text-sm text-casamento-oliva-escuro hover:underline mt-2 inline-block font-medium"
                  >
                    Ver produto →
                  </a>
                )}
                <button
                  type="button"
                  onClick={() =>
                    setPresenteSelecionado(presenteSelecionado?.nome === p.nome ? null : p)
                  }
                  className="mt-4 w-full py-3 bg-casamento-oliva-escuro text-white font-sans font-medium rounded-2xl hover:bg-casamento-oliva transition-all duration-200 shadow-sm focus:ring-2 focus:ring-casamento-oliva focus:ring-offset-2 focus:outline-none"
                >
                  {presenteSelecionado?.nome === p.nome ? "Fechar" : "Contribuir"}
                </button>
              </div>
            </div>
          ))}
      </div>

      {presenteSelecionado && (
        <section className="mt-12 p-8 bg-white rounded-2xl shadow-sm border border-stone-100">
          <p className="font-sans text-stone-400 text-xs uppercase tracking-widest mb-2">
            Pix ou cartão
          </p>
          <h2 className="font-heading text-xl font-light text-stone-800 mb-4">
            {presenteSelecionado.nome}
          </h2>
          <p className="text-stone-600 text-sm mb-4">
            Escaneie o QR Code ou copie a chave. Depois clique em &quot;Já fiz o Pix&quot; para registrar.
          </p>
          <QrCodePix />
          <FormPix
            key={presenteSelecionado.nome}
            token={token}
            catalog={catalog}
            presentePreselecionado={presenteSelecionado.nome}
          />
          <FormMercadoPago
            token={token}
            presenteNome={presenteSelecionado.nome}
            precoCatalogo={presenteSelecionado.preco}
          />
        </section>
      )}
    </>
  );
}
