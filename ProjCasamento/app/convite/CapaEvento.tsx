import type { ReactNode } from "react";
import Link from "next/link";
import { InvitePageShell } from "@/components/invite/InvitePageShell";
import BannerPresencaConvite from "./BannerPresencaConvite";
import ContagemRegressiva from "./ContagemRegressiva";
import {
  formatarDataEvento,
  formatarHoraEvento,
  formatarPrazoConfirmacao,
  getEventoTimestamp,
  nomeDestaque,
  prazoConfirmacaoEncerrado,
  type EventoPublico,
} from "@/lib/evento";

type Props = {
  evento: EventoPublico;
  token: string;
  nomeConvidado: string;
  respondeuPresenca: boolean;
  presencaConfirmada: boolean;
};

function BotaoAcao({
  href,
  titulo,
  descricao,
  icone,
  principal,
}: {
  href: string;
  titulo: string;
  descricao: string;
  icone: ReactNode;
  principal?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex min-h-[5.25rem] w-full items-center gap-4 rounded-2xl border-2 px-5 py-4 text-left shadow-sm transition-transform hover:scale-[1.01] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-invite-olive ${
        principal
          ? "border-invite-olive bg-invite-olive text-white"
          : "border-invite-olive/40 bg-white/80 text-invite-olive"
      }`}
    >
      <span
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
          principal ? "bg-white/15" : "bg-invite-olive/10"
        }`}
        aria-hidden
      >
        {icone}
      </span>
      <span className="min-w-0">
        <span className="block font-invite-caps text-[1.02rem] font-semibold uppercase tracking-[0.08em]">
          {titulo}
        </span>
        <span className={`mt-0.5 block font-sans text-[0.92rem] ${principal ? "text-white/85" : "text-invite-olive/75"}`}>
          {descricao}
        </span>
      </span>
    </Link>
  );
}

const svgProps = { width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6 } as const;

export default function CapaEvento({
  evento,
  token,
  nomeConvidado,
  respondeuPresenca,
  presencaConfirmada,
}: Props) {
  const nome = nomeDestaque(evento);
  const partes = nome.split(/\s*&\s*/);
  const data = formatarDataEvento(evento);
  const hora = formatarHoraEvento(evento);
  const alvo = getEventoTimestamp(evento);
  const t = encodeURIComponent(token);
  const primeiroNome = nomeConvidado.trim().split(/\s+/)[0];
  const prazo = formatarPrazoConfirmacao(evento);
  const encerrado = prazoConfirmacaoEncerrado(evento);

  return (
    <InvitePageShell className="py-10 sm:py-14">
      <div className="mx-auto w-full max-w-[34rem] px-5 sm:px-8">
        <header className="text-center">
          {evento.titulo ? (
            <p className="font-invite-caps text-[0.85rem] font-medium uppercase tracking-[0.28em] text-invite-olive/80">
              {evento.titulo}
            </p>
          ) : null}
          <h1 className="font-nomes-noivos mt-3 text-balance text-[clamp(3.4rem,14vw,5.5rem)] leading-[1.05] text-invite-olive">
            {partes.length === 2 ? (
              <>
                {partes[0]} <span className="text-[0.55em]">&amp;</span> {partes[1]}
              </>
            ) : (
              nome
            )}
          </h1>
          {data ? (
            <p className="mt-5 font-invite-caps text-[0.98rem] font-medium uppercase tracking-[0.12em] text-invite-olive">
              {data}
              {hora ? ` · ${hora}` : ""}
            </p>
          ) : null}
          {evento.localNome ? (
            <p className="mt-2 font-sans text-[1rem] text-invite-olive/85">
              {evento.localNome}
              {evento.localEndereco ? (
                <>
                  <br />
                  <span className="text-[0.92rem] text-invite-olive/70">{evento.localEndereco}</span>
                </>
              ) : null}
            </p>
          ) : null}
        </header>

        <div className="mx-auto my-8 h-px w-24 bg-invite-olive/30" aria-hidden />

        <p className="text-center font-heading text-[1.35rem] italic text-invite-olive">Olá, {primeiroNome}!</p>
        {evento.textoCapa ? (
          <p className="mx-auto mt-3 max-w-md whitespace-pre-line text-center font-sans text-[1rem] leading-relaxed text-invite-olive/85">
            {evento.textoCapa}
          </p>
        ) : null}

        <div className="mt-8">
          <BannerPresencaConvite
            token={token}
            respondeuInicial={respondeuPresenca}
            confirmadoInicial={presencaConfirmada}
          />
        </div>

        <nav aria-label="O que você deseja fazer?" className="mt-2 grid gap-4">
          <BotaoAcao
            href={`/confirmacao?token=${t}`}
            titulo={encerrado ? "Confirmações encerradas" : "Confirmar presença"}
            descricao={
              encerrado
                ? `O prazo terminou em ${prazo}`
                : prazo
                  ? `Confirme até ${prazo}`
                  : "Diga se você vai e quem vai com você"
            }
            principal={!respondeuPresenca && !encerrado}
            icone={
              <svg {...svgProps}>
                <path d="M6 12.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            }
          />
          {evento.listaPresentes ? (
            <BotaoAcao
              href={`/presentes?token=${t}`}
              titulo="Lista de presentes"
              descricao="Presenteie com Pix ou cartão"
              principal={respondeuPresenca || encerrado}
              icone={
                <svg {...svgProps}>
                  <path d="M4 10h16v10H4V10zM12 10v10M4 10h16M12 6c-1.5 0-3 1-3 3h6c0-2-1.5-3-3-3z" strokeLinejoin="round" />
                </svg>
              }
            />
          ) : null}
          <BotaoAcao
            href={`/recados?token=${t}`}
            titulo="Deixar recado"
            descricao="Escreva uma mensagem carinhosa"
            icone={
              <svg {...svgProps}>
                <path d="M4 5h16v11H8l-4 4V5z" strokeLinejoin="round" />
              </svg>
            }
          />
          {evento.localMapUrl ? (
            <a
              href={evento.localMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 text-center font-invite-caps text-[0.9rem] font-semibold uppercase tracking-[0.12em] text-invite-olive underline-offset-4 hover:underline"
            >
              Como chegar (abrir mapa)
            </a>
          ) : null}
        </nav>

        {alvo > 0 ? (
          <div className="mt-12">
            <ContagemRegressiva alvo={alvo} variant="invite" compact />
          </div>
        ) : null}
      </div>
    </InvitePageShell>
  );
}
