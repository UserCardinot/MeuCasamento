import { existsSync } from "node:fs";
import path from "node:path";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { SimboloMickey } from "@/components/invite/SimboloMickey";
import {
  diasAteEvento,
  getDataHoraConviteUppercase,
  nomeDestaque,
  type EventoPublico,
} from "@/lib/evento";

type Props = {
  evento: EventoPublico;
  token: string;
  nomeConvidado: string;
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

const botao =
  "inline-flex items-center justify-center rounded-full px-[max(0.8rem,2.6cqmin)] py-[max(0.4rem,1.4cqmin)] font-invite-caps font-semibold uppercase tracking-[0.08em] shadow-md transition-transform hover:scale-[1.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black portrait:px-[4cqw] portrait:py-[2cqw]";

const pontinhosBrancos = {
  backgroundImage: "radial-gradient(circle at 14px 14px, rgba(255,255,255,0.22) 5px, transparent 6px)",
  backgroundSize: "28px 28px",
};

function textoDias(dias: number | null): string | null {
  if (dias === null || dias < 0) return null;
  if (dias === 0) return "É hoje!";
  if (dias === 1) return "É amanhã!";
  return `Faltam ${dias} dias!`;
}

function Botao({
  href,
  externo,
  className = "bg-invite-olive text-white",
  children,
}: {
  href: string;
  externo?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const cls = `${botao} ${txt.pequeno} ${className}`;
  if (externo) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

export default function ConviteMickey({
  evento,
  token,
  nomeConvidado,
  respondeuPresenca,
  presencaConfirmada,
}: Props) {
  const nome = nomeDestaque(evento);
  const idade = evento.titulo.match(/(\d+)\s*anos?/i)?.[1];
  const dataHora = getDataHoraConviteUppercase(evento);
  const dias = textoDias(diasAteEvento(evento));
  const t = encodeURIComponent(token);
  const primeiroNome = nomeConvidado.split(/\s+/)[0];
  const temCapa = existsSync(path.join(process.cwd(), "public", "eventos", evento.slug, "capa.png"));

  const confirmar = presencaConfirmada
    ? { rotulo: "Presença confirmada ✓", cls: "bg-[#FFC400] text-black" }
    : respondeuPresenca
      ? { rotulo: "Rever presença", cls: "bg-invite-olive text-white" }
      : { rotulo: "Confirmar presença", cls: "bg-invite-olive text-white" };

  return (
    <main className="invite-page-shell flex h-[100svh] w-full items-center justify-center overflow-hidden p-3 sm:p-5">
      <div className="relative flex overflow-hidden rounded-2xl border-4 border-black bg-white shadow-2xl [container-type:size] landscape:aspect-[16/9] landscape:w-[min(100%,calc((100svh-2.5rem)*16/9))] portrait:h-full portrait:w-full portrait:flex-col">
        <div
          className="relative shrink-0 bg-invite-olive landscape:h-full landscape:w-[42%] landscape:border-r-[6px] landscape:border-[#FFC400] portrait:h-[36%] portrait:w-full portrait:border-b-[6px] portrait:border-[#FFC400]"
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

        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center gap-[2cqmin] px-[4cqw] py-[3cqh] text-center portrait:gap-[2.4cqw]">
          <p className={`font-invite-caps font-medium uppercase tracking-[0.14em] text-black ${txt.pequeno}`}>
            {primeiroNome}, você está convidado(a)
          </p>

          <h1 className={`font-nomes-noivos leading-[0.95] text-invite-olive ${txt.nome}`}>{nome}</h1>

          {evento.titulo && evento.titulo.trim() !== nome ? (
            <p className={`font-invite-caps font-semibold text-black ${txt.medio}`}>{evento.titulo}</p>
          ) : null}

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

          {dias ? (
            <p className={`font-nomes-noivos font-bold text-black ${txt.medio}`}>
              <span className="rounded-lg bg-[#FFC400] px-[1.6cqmin] py-[0.4cqmin]">{dias}</span>
            </p>
          ) : null}

          <nav
            aria-label="Ações do convite"
            className="mt-[1cqmin] flex flex-wrap items-center justify-center gap-[1.4cqmin] portrait:gap-[2cqw]"
          >
            <Botao href={`/confirmacao?token=${t}`} className={confirmar.cls}>
              {confirmar.rotulo}
            </Botao>
            <Botao href={`/presentes?token=${t}`}>Presentes</Botao>
            {evento.localMapUrl ? (
              <Botao href={evento.localMapUrl} externo className="bg-black text-white">
                Como chegar
              </Botao>
            ) : null}
            <Botao href={`/recados?token=${t}`} className="bg-white text-invite-olive ring-2 ring-invite-olive">
              Recados
            </Botao>
          </nav>
        </div>
      </div>
    </main>
  );
}
