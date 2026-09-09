import { EVENTO } from "@/lib/evento";

const { primeiro, segundo } = EVENTO.noivos;

export function getConviteOpenGraphTitle(): string {
  return `Convite — ${primeiro} & ${segundo}`;
}

export function getConviteOpenGraphDescription(): string {
  return `${EVENTO.dataFormatada} · ${EVENTO.local.nome}`;
}

/** Dias civis até a data do casamento (fuso de São Paulo). */
export function diasAteOCasamento(agora = new Date()): number {
  const tz = "America/Sao_Paulo";
  const hoje = agora.toLocaleDateString("en-CA", { timeZone: tz });
  const start = new Date(`${hoje}T12:00:00`);
  const end = new Date(`${EVENTO.data}T12:00:00`);
  return Math.round((end.getTime() - start.getTime()) / 86_400_000);
}

/**
 * Converte link do convite (`/convite?token=`) para a lista de presentes
 * do mesmo convidado (`/presentes?token=`).
 */
export function toPresentesLink(link: string): string {
  try {
    const absolute = /^https?:\/\//i.test(link);
    const u = new URL(link, "http://localhost");
    const token = u.searchParams.get("token");
    if (!token) {
      return link.replace(/\/convite(?=\?|$)/i, "/presentes");
    }
    if (absolute) {
      u.pathname = "/presentes";
      u.search = `?token=${encodeURIComponent(token)}`;
      u.hash = "";
      return u.toString();
    }
    return `/presentes?token=${encodeURIComponent(token)}`;
  } catch {
    return link.replace(/\/convite(?=\?|$)/i, "/presentes");
  }
}

/** Emojis via code points — evita perda de encoding no build/Windows. */
const E = {
  ring: "\u{1F48D}",
  redHeart: "\u2764\uFE0F",
  house: "\u{1F3E1}",
  pointDown: "\u{1F447}\u{1F3FD}",
  loveFace: "\u{1F970}",
  whiteHeart: "\u{1F90D}",
} as const;

/**
 * Mensagem do WhatsApp — link da lista de presentes em linha própria (preview com logo L&B).
 */
export function buildConviteWhatsAppMessage(link: string, _nomeConvidado?: string): string {
  const presentesLink = toPresentesLink(link);

  return `Nosso casamento está chegando ${E.ring}

Agora é contagem regressiva para o nosso grande dia! Estamos vivendo cada momento com o coração cheio de alegria e expectativa para celebrar esse sonho ao lado de pessoas que tanto amamos ${E.redHeart}

E, para quem nos pergunta sobre presentes, deixamos uma listinha preparada com alguns itens que vão fazer parte do nosso novo lar e dessa nova fase juntos. ${E.house}

Clique aqui para conferir ${E.pointDown}
${presentesLink}

Mas o mais importante é ter vocês conosco nesse dia tão especial. A presença de cada um será um dos nossos maiores presentes! ${E.loveFace}

Falta pouco!
Nos vemos dia 26.09.2026 às 08:30${E.whiteHeart}`;
}

export function buildConviteWhatsAppUrl(link: string, nomeConvidado?: string): string {
  const text = encodeURIComponent(buildConviteWhatsAppMessage(link, nomeConvidado));
  // api.whatsapp.com costuma preservar melhor Unicode/emojis que wa.me em alguns clientes
  return `https://api.whatsapp.com/send?text=${text}`;
}
