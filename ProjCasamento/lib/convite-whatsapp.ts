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

/**
 * Texto curto no WhatsApp — o convite aparece na miniatura do link (Open Graph).
 * Mantenha o link sozinho na última linha para o preview carregar.
 */
export function buildConviteWhatsAppMessage(link: string, nomeConvidado?: string): string {
  const nome = nomeConvidado?.trim() ? primeiroNome(nomeConvidado) : null;
  if (nome) return `Olá, ${nome}!\n${link}`;
  return link;
}

export function buildConviteWhatsAppUrl(link: string, nomeConvidado?: string): string {
  return `https://wa.me/?text=${encodeURIComponent(buildConviteWhatsAppMessage(link, nomeConvidado))}`;
}
