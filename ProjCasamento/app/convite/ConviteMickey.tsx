import { existsSync } from "node:fs";
import path from "node:path";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { SimboloMickey } from "@/components/invite/SimboloMickey";
import ContagemMickey from "./ContagemMickey";
import {
  formatarPrazoConfirmacao,
  getDataHoraConviteUppercase,
  getEventoTimestamp,
  nomeDestaque,
  prazoConfirmacaoEncerrado,
  type EventoPublico,
} from "@/lib/evento";

type Props = {
  evento: EventoPublico;
  token: string;
  respondeuPresenca: boolean;
  presencaConfirmada: boolean;
};

/*
 * Tamanhos relativos ao cartão (container queries): o convite inteiro cabe numa tela, sem rolagem.
 * Em retrato o cartão vira vertical e as fontes passam a seguir a largura.
 */
const txt = {
  pequeno: "text-[max(0.68rem,2.5cqmin)] portrait:text-[max(0.78rem,3.5cqw)]",
  medio: "text-[max(0.78rem,3.3cqmin)] portrait:text-[max(0.9rem,4.4cqw)]",
  nome: "text-[max(2.4rem,13cqmin)] portrait:text-[max(2.8rem,15cqw)]",
} as const;

/** Estilo "cartoon": contorno preto e sombra sólida que afunda ao clicar. */
const botao =
  "flex w-full items-center justify-center whitespace-nowrap rounded-2xl border-[3px] border-black px-[max(0.5rem,1.6cqmin)] font-nomes-noivos font-bold leading-tight shadow-[0_5px_0_#111] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_7px_0_#111] active:translate-y-[5px] active:shadow-none focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-[#FFC400]";

const botaoPrincipal =
  "gap-[max(0.5rem,1.4cqmin)] py-[max(0.7rem,2.2cqmin)] text-[max(1rem,3.6cqmin)] portrait:py-[3cqw] portrait:text-[max(1.05rem,5cqw)]";

/** Ícone em cima do texto, para caberem três lado a lado. */
const botaoSecundario =
  "flex-col gap-[max(0.2rem,0.6cqmin)] py-[max(0.5rem,1.6cqmin)] text-[max(0.8rem,2.6cqmin)] portrait:py-[2.4cqw] portrait:text-[max(0.85rem,3.8cqw)]";

const icone = "h-[1.3em] w-[1.3em] shrink-0";

function IconeCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={icone} aria-hidden>
      <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.18" />
      <path d="M7 12.5l3.2 3.2L17 9" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconePresente() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={icone} aria-hidden>
      <rect x="3.5" y="9" width="17" height="11.5" rx="1.8" stroke="currentColor" strokeWidth="2.2" />
      <path d="M2.5 9h19M12 9v11.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M12 9c-1.2-3.4-5.2-4.4-5.2-1.6C6.8 9 12 9 12 9zm0 0c1.2-3.4 5.2-4.4 5.2-1.6C17.2 9 12 9 12 9z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function IconePin() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={icone} aria-hidden>
      <path d="M12 21.5s7-5.2 7-11.5a7 7 0 10-14 0c0 6.3 7 11.5 7 11.5z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2.6" fill="currentColor" />
    </svg>
  );
}

function IconeRecado() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={icone} aria-hidden>
      <path d="M4 5.5h16a1.5 1.5 0 011.5 1.5v9a1.5 1.5 0 01-1.5 1.5H10l-4.5 3.5V17.5H4A1.5 1.5 0 012.5 16V7A1.5 1.5 0 014 5.5z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M7.5 10h9M7.5 13.5h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const pontinhosBrancos = {
  backgroundImage: "radial-gradient(circle at 14px 14px, rgba(255,255,255,0.22) 5px, transparent 6px)",
  backgroundSize: "28px 28px",
};

function Botao({
  href,
  externo,
  icone,
  className,
  children,
}: {
  href: string;
  externo?: boolean;
  icone: ReactNode;
  className: string;
  children: ReactNode;
}) {
  const cls = `${botao} ${className}`;
  const conteudo = (
    <>
      {icone}
      <span>{children}</span>
    </>
  );
  if (externo) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {conteudo}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {conteudo}
    </Link>
  );
}

export default function ConviteMickey({
  evento,
  token,
  respondeuPresenca,
  presencaConfirmada,
}: Props) {
  const nome = nomeDestaque(evento);
  const idade = evento.titulo.match(/(\d+)\s*anos?/i)?.[1];
  const dataHora = getDataHoraConviteUppercase(evento);
  const alvo = getEventoTimestamp(evento);
  const t = encodeURIComponent(token);
  const temCapa = existsSync(path.join(process.cwd(), "public", "eventos", evento.slug, "capa.png"));

  const prazo = formatarPrazoConfirmacao(evento);
  const encerrado = prazoConfirmacaoEncerrado(evento);

  const confirmar = presencaConfirmada
    ? { rotulo: "Presença confirmada", cls: "bg-[#22A04B] text-white" }
    : encerrado
      ? { rotulo: "Confirmações encerradas", cls: "bg-zinc-300 text-zinc-700" }
      : respondeuPresenca
        ? { rotulo: "Rever presença", cls: "bg-invite-olive text-white" }
        : { rotulo: "Confirmar presença", cls: "bg-invite-olive text-white" };

  const secundarios = 1 + (evento.listaPresentes ? 1 : 0) + (evento.localMapUrl ? 1 : 0);
  const gradeCols = ({ 1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3" } as const)[secundarios as 1 | 2 | 3];
  const spanTodas = ({ 1: "col-span-1", 2: "col-span-2", 3: "col-span-3" } as const)[secundarios as 1 | 2 | 3];

  return (
    <main className="invite-page-shell flex w-full justify-center p-3 sm:p-5 landscape:h-[100svh] landscape:items-center landscape:overflow-hidden portrait:min-h-[100svh] portrait:items-start portrait:py-5">
      {/* Em retrato a altura é livre (rola a página): container só na largura. */}
      <div className="relative flex overflow-hidden rounded-2xl border-4 border-black bg-white shadow-2xl landscape:aspect-[16/9] landscape:w-[min(100%,calc((100svh-2.5rem)*16/9))] landscape:[container-type:size] portrait:w-full portrait:flex-col portrait:[container-type:inline-size]">
        <div
          className="relative shrink-0 bg-invite-olive landscape:h-full landscape:w-[42%] landscape:border-r-[6px] landscape:border-[#FFC400] portrait:h-[100cqw] portrait:max-h-[60svh] portrait:w-full portrait:border-b-[6px] portrait:border-[#FFC400]"
          style={pontinhosBrancos}
        >
          <div className="absolute inset-x-[6%] bottom-0 top-[5%] flex flex-col items-center">
            <div className="relative min-h-0 w-full flex-1">
              {temCapa ? (
                <Image
                  src={`/eventos/${evento.slug}/capa.png`}
                  alt={nome}
                  fill
                  className="object-contain object-bottom drop-shadow-[0_6px_10px_rgba(0,0,0,0.35)]"
                  sizes="(orientation: portrait) 100vw, 45vw"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-end justify-center">
                  <SimboloMickey className="h-auto max-h-full w-[72%]" />
                </div>
              )}
            </div>
            {idade ? (
              <p
                className="font-nomes-noivos shrink-0 py-[2.5cqmin] text-center font-bold leading-none text-[#FFC400] text-[max(2rem,10cqmin)] portrait:py-[2cqw] portrait:text-[max(2rem,11cqw)]"
                style={{ WebkitTextStroke: "0.06em #111111", paintOrder: "stroke fill" }}
              >
                {idade} {idade === "1" ? "ano" : "anos"}
              </p>
            ) : null}
          </div>
        </div>

        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center gap-[2cqmin] px-[4cqw] py-[3cqh] text-center portrait:gap-[3.4cqw] portrait:px-[5cqw] portrait:pb-[7cqw] portrait:pt-[14cqw]">
          <SimboloMickey className="absolute right-[2.5cqmin] top-[2.5cqmin] h-auto w-[max(2.5rem,9cqmin)] portrait:right-[3cqw] portrait:top-[3cqw] portrait:w-[11cqw]" />
          <p className="max-w-[90%] font-invite-caps font-bold uppercase leading-snug tracking-[0.1em] text-black text-[max(0.8rem,3cqmin)] portrait:text-[max(0.95rem,4.6cqw)]">
            Você está convidado para o aniversário de
          </p>

          <h1 className={`font-nomes-noivos leading-[0.95] text-invite-olive ${txt.nome}`}>{nome}</h1>

          <p className={`font-invite-caps font-semibold text-black ${txt.medio}`}>
            Venha celebrar com a gente esse dia tão especial!
          </p>

          {dataHora ? (
            <p
              className={`rounded-full bg-black px-[3cqmin] py-[1.2cqmin] font-invite-caps font-semibold uppercase tracking-[0.1em] text-[#FFC400] portrait:px-[4cqw] portrait:py-[1.6cqw] ${txt.pequeno}`}
            >
              {dataHora}
            </p>
          ) : null}

          {evento.localNome || evento.localEndereco ? (
            <div className="flex flex-col items-center">
              {evento.localNome ? (
                <p className={`font-invite-caps font-bold uppercase tracking-[0.1em] text-invite-olive ${txt.medio}`}>
                  {evento.localNome}
                </p>
              ) : null}
              {evento.localEndereco ? (
                <p className={`font-sans text-black/70 ${txt.pequeno}`}>{evento.localEndereco}</p>
              ) : null}
            </div>
          ) : null}

          {alvo > 0 ? <ContagemMickey alvo={alvo} /> : null}

          <nav
            aria-label="Ações do convite"
            className={`mt-[1.2cqmin] grid w-full max-w-[min(100%,74cqmin)] gap-x-[1.6cqmin] gap-y-[2.2cqmin] pb-[5px] portrait:max-w-full portrait:gap-x-[2.6cqw] portrait:gap-y-[3.4cqw] ${gradeCols}`}
          >
            <Botao
              href={`/confirmacao?token=${t}`}
              icone={<IconeCheck />}
              className={`${botaoPrincipal} ${confirmar.cls} ${spanTodas}`}
            >
              {confirmar.rotulo}
            </Botao>
            {prazo && !encerrado && !respondeuPresenca ? (
              <p className={`-mt-[1cqmin] font-sans font-medium text-black/70 ${spanTodas} ${txt.pequeno}`}>
                Confirme até {prazo}
              </p>
            ) : null}
            {evento.listaPresentes ? (
              <Botao
                href={`/presentes?token=${t}`}
                icone={<IconePresente />}
                className={`${botaoSecundario} bg-[#FFC400] text-black`}
              >
                Presentes
              </Botao>
            ) : null}
            {evento.localMapUrl ? (
              <Botao
                href={evento.localMapUrl}
                externo
                icone={<IconePin />}
                className={`${botaoSecundario} bg-black text-white`}
              >
                Como chegar
              </Botao>
            ) : null}
            <Botao href={`/recados?token=${t}`} icone={<IconeRecado />} className={`${botaoSecundario} bg-white text-invite-olive`}>
              Recados
            </Botao>
          </nav>
        </div>
      </div>
    </main>
  );
}
