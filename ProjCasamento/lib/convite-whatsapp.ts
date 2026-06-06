import { EVENTO } from "@/lib/evento";

const { primeiro, segundo } = EVENTO.noivos;

export function getConviteOpenGraphTitle(): string {
  return `Convite — ${primeiro} & ${segundo}`;
}

export function getConviteOpenGraphDescription(): string {
  return `${EVENTO.dataFormatada} · ${EVENTO.local.nome}`;
}

/** Primeiro nome para saudação no WhatsApp */
function primeiroNome(nomeCompleto: string): string {
  const n = nomeCompleto.trim().split(/\s+/)[0];
  return n || nomeCompleto.trim();
}

const PRAZO_CONFIRMACAO_PRESENCA = "02 de agosto de 2026";

/**
 * Mensagem do convite no WhatsApp — o link em linha própria ajuda o preview (Open Graph).
 */
export function buildConviteWhatsAppMessage(link: string, nomeConvidado?: string): string {
  const saudacao = nomeConvidado?.trim()
    ? `Olá, ${primeiroNome(nomeConvidado)}!`
    : "Olá!";

  return `${saudacao}

É com muita alegria que convidamos você para celebrar o nosso casamento!

Acesse o nosso convite digital no link abaixo para ver os detalhes da cerimônia, festa, lista de presentes e confirmar sua presença:

${link}

Confirme sua presença até o dia ${PRAZO_CONFIRMACAO_PRESENCA}.

Esperamos você lá! 💚`;
}

export function buildConviteWhatsAppUrl(link: string, nomeConvidado?: string): string {
  return `https://wa.me/?text=${encodeURIComponent(buildConviteWhatsAppMessage(link, nomeConvidado))}`;
}
