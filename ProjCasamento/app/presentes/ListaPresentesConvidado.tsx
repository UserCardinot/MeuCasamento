"use client";

import { useEffect, useMemo, useState } from "react";
import AlertaCarrinhoPresentes from "./AlertaCarrinhoPresentes";
import { IconeSacolaCompras } from "./CarrinhoPresentes";
import DrawerCarrinhoPresentes from "./DrawerCarrinhoPresentes";
import ModalPagamentoPresente from "./ModalPagamentoPresente";
import PagamentoPresente from "./PagamentoPresente";
import { matchBuscaCatalogoPresente, somaPrecosCatalogo } from "@/lib/presentes-checkout";
import {
  presentesBtnOutline,
  presentesBtnPrimary,
  presentesCard,
  presentesFieldClass,
} from "./presentesTheme";

type Presente = { nome: string; preco: string; url: string; imagem: string };

type Props = {
  token: string;
  catalog: Presente[];
  presenteRegistrado: { presente: string; valor?: string } | null;
};

function IconeBusca({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
      <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function CardPresente({
  presente,
  selecionado,
  onToggle,
}: {
  presente: Presente;
  selecionado: boolean;
  onToggle: () => void;
}) {
  const { nome, preco, url, imagem } = presente;

  return (
    <article
      className={`flex gap-3 border p-3 transition-shadow sm:gap-3.5 sm:p-3.5 ${
        selecionado
          ? "border-invite-olive/55 bg-white shadow-sm ring-1 ring-invite-olive/25"
          : "border-invite-olive/20 bg-white/75 hover:border-invite-olive/35 hover:bg-white/90"
      }`}
    >
      {imagem ? (
        <a
          href={url || imagem}
          target="_blank"
          rel="noopener noreferrer"
          className="relative h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden border border-invite-olive/15 bg-invite-cream/50 sm:h-20 sm:w-20"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imagem} alt={nome} className="h-full w-full object-cover" />
          {selecionado && (
            <span className="font-invite-caps absolute inset-x-0 bottom-0 bg-invite-olive/90 py-0.5 text-center text-[0.5rem] font-semibold uppercase tracking-wider text-white">
              ✓
            </span>
          )}
        </a>
      ) : (
        <div
          className={`flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center border sm:h-20 sm:w-20 ${
            selecionado ? "border-invite-olive/40 bg-invite-olive/10" : "border-invite-olive/15 bg-invite-cream/50"
          }`}
          aria-hidden
        >
          <span className="font-heading text-2xl italic text-invite-olive/25">♥</span>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
        <div className="min-w-0">
          <h3 className="line-clamp-2 font-heading text-base italic leading-snug text-invite-olive sm:text-[1.05rem]">
            {nome}
          </h3>
          {preco && (
            <p className="font-invite-caps mt-1 text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-invite-olive/90">
              R$ {preco.replace(".", ",")}
            </p>
          )}
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-invite-caps mt-1 inline-block text-[0.62rem] font-medium uppercase tracking-[0.12em] text-invite-olive/60 underline-offset-2 hover:text-invite-olive hover:underline"
            >
              Ver na loja
            </a>
          )}
        </div>
        <button
          type="button"
          onClick={onToggle}
          className={`${selecionado ? presentesBtnOutline : presentesBtnPrimary} !py-2.5 !text-[0.68rem] sm:!py-2.5`}
          aria-pressed={selecionado}
        >
          {selecionado ? "Remover" : "Adicionar"}
        </button>
      </div>
    </article>
  );
}

export default function ListaPresentesConvidado({ token, catalog, presenteRegistrado }: Props) {
  const [selecionados, setSelecionados] = useState<Presente[]>([]);
  const [modalPagamentoAberto, setModalPagamentoAberto] = useState(false);
  const [carrinhoDrawerAberto, setCarrinhoDrawerAberto] = useState(false);
  const [alertaCarrinhoOculto, setAlertaCarrinhoOculto] = useState(false);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    if (selecionados.length === 0) setAlertaCarrinhoOculto(false);
  }, [selecionados.length]);

  function abrirPagamento() {
    setCarrinhoDrawerAberto(false);
    setModalPagamentoAberto(true);
  }

  function verCarrinho() {
    setCarrinhoDrawerAberto(true);
  }

  const catalogFiltrado = useMemo(
    () => catalog.filter((p) => matchBuscaCatalogoPresente(busca, p)),
    [catalog, busca]
  );

  const totalSugerido = useMemo(() => somaPrecosCatalogo(selecionados), [selecionados]);

  function togglePresente(p: Presente) {
    setModalPagamentoAberto(false);
    setSelecionados((prev) => {
      const ja = prev.some((x) => x.nome === p.nome);
      if (ja) return prev.filter((x) => x.nome !== p.nome);
      setAlertaCarrinhoOculto(false);
      return [...prev, p];
    });
  }

  function removerDoCarrinho(nome: string) {
    setModalPagamentoAberto(false);
    setSelecionados((prev) => prev.filter((x) => x.nome !== nome));
  }

  function limparCarrinho() {
    setModalPagamentoAberto(false);
    setSelecionados([]);
  }

  if (presenteRegistrado) {
    return (
      <div
        className={`${presentesCard} flex flex-col items-center gap-3 px-6 py-8 text-center sm:flex-row sm:text-left`}
        role="status"
      >
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-invite-olive text-invite-olive"
          aria-hidden
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 12.5l4 4 8-9"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <div>
          <p className="font-invite-caps text-[0.82rem] font-semibold uppercase tracking-[0.14em] text-invite-olive">
            Contribuição registrada
          </p>
          <p className="font-sans mt-1 text-sm text-invite-olive/85">
            {presenteRegistrado.presente}
            {presenteRegistrado.valor && ` — R$ ${presenteRegistrado.valor.replace(".", ",")}`}
          </p>
        </div>
      </div>
    );
  }

  if (catalog.length === 0) {
    return (
      <div className={`${presentesCard} px-8 py-14 text-center`}>
        <p className="font-heading text-lg italic text-invite-olive">Em breve</p>
        <p className="font-sans mt-3 text-sm text-invite-olive/75">
          Os noivos ainda estão organizando a lista. Volte em alguns dias.
        </p>
      </div>
    );
  }

  const carrinhoProps = {
    itens: selecionados,
    totalSugerido,
    onRemover: removerDoCarrinho,
    onLimpar: limparCarrinho,
    onContinuar: abrirPagamento,
  };

  const isProducao = process.env.NODE_ENV === "production";

  const mostrarAlertaCarrinho =
    !isProducao &&
    selecionados.length > 0 &&
    !alertaCarrinhoOculto &&
    !carrinhoDrawerAberto &&
    !modalPagamentoAberto;

  return (
    <>
      {mostrarAlertaCarrinho && (
        <AlertaCarrinhoPresentes
          variant="mobile"
          quantidade={selecionados.length}
          total={totalSugerido}
          onVerCarrinho={verCarrinho}
          onDispensar={() => setAlertaCarrinhoOculto(true)}
        />
      )}

      <button
        type="button"
        onClick={() => setCarrinhoDrawerAberto(true)}
        className="fixed right-3 top-3 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-invite-olive/35 bg-invite-cream text-invite-olive shadow-lg transition-transform hover:scale-[1.03] active:scale-[0.98] md:hidden"
        aria-label={
          selecionados.length > 0
            ? `Abrir carrinho, ${selecionados.length} itens`
            : "Abrir carrinho"
        }
      >
        <IconeSacolaCompras className="h-5 w-5" />
        {selecionados.length > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-invite-olive px-1 font-sans text-[0.65rem] font-bold leading-none text-white">
            {selecionados.length}
          </span>
        )}
      </button>

      <DrawerCarrinhoPresentes
        open={carrinhoDrawerAberto}
        onClose={() => setCarrinhoDrawerAberto(false)}
        {...carrinhoProps}
      />

      <section className="flex min-h-0 w-full flex-col pt-2 md:pt-0" aria-label="Lista de presentes">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <p className="font-sans text-xs text-invite-olive/70">
            {catalogFiltrado.length} de {catalog.length}{" "}
            {catalog.length === 1 ? "item" : "itens"}
          </p>
          <button
            type="button"
            onClick={() => setCarrinhoDrawerAberto(true)}
            className="font-invite-caps hidden items-center gap-2.5 border border-invite-olive/35 bg-invite-cream px-4 py-2.5 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-invite-olive shadow-sm transition-colors hover:border-invite-olive/50 hover:bg-white md:inline-flex"
            aria-label={
              selecionados.length > 0
                ? `Abrir carrinho, ${selecionados.length} itens`
                : "Abrir carrinho"
            }
          >
            <span className="relative flex h-9 w-9 items-center justify-center rounded-full border border-invite-olive/25 bg-white text-invite-olive">
              <IconeSacolaCompras className="h-[1.05rem] w-[1.05rem]" />
              {selecionados.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-invite-olive px-1 font-sans text-[0.58rem] font-bold leading-none text-white">
                  {selecionados.length}
                </span>
              )}
            </span>
            Carrinho
          </button>
        </div>

        {mostrarAlertaCarrinho && (
          <AlertaCarrinhoPresentes
            variant="inline"
            quantidade={selecionados.length}
            total={totalSugerido}
            onVerCarrinho={verCarrinho}
            onDispensar={() => setAlertaCarrinhoOculto(true)}
          />
        )}

        <label className="relative mb-3 block">
          <span className="sr-only">Buscar por nome</span>
          <IconeBusca className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-invite-olive/45" />
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome…"
            className={`${presentesFieldClass} !py-3 pl-10`}
          />
        </label>

        <div className="min-h-[12rem] max-h-[calc(100vh-14rem)] overflow-y-auto overscroll-y-contain pr-0.5 md:max-h-[calc(100vh-12rem)]">
          {catalogFiltrado.length === 0 ? (
            <p className={`${presentesCard} px-5 py-8 text-center font-sans text-sm text-invite-olive/75`}>
              Nenhum presente encontrado com esse nome.
            </p>
          ) : (
            <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3 lg:gap-4">
              {catalogFiltrado.map((p, i) => {
                const selecionado = selecionados.some((x) => x.nome === p.nome);
                return (
                  <CardPresente
                    key={`${p.nome}-${i}`}
                    presente={p}
                    selecionado={selecionado}
                    onToggle={() => togglePresente(p)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>

      <ModalPagamentoPresente
        open={modalPagamentoAberto && selecionados.length > 0}
        onClose={() => setModalPagamentoAberto(false)}
      >
        <PagamentoPresente
          key={selecionados.map((p) => p.nome).join("|")}
          token={token}
          presentes={selecionados}
        />
      </ModalPagamentoPresente>
    </>
  );
}
