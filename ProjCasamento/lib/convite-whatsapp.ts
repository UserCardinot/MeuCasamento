import {
  diasAteEvento,
  formatarDataEvento,
  formatarHoraEvento,
  nomeDestaque,
  type EventoPublico,
} from "@/lib/evento";

type EventoWhats = Pick<EventoPublico, "titulo" | "anfitrioes" | "data" | "hora" | "whatsappTemplate">;

const TEMPLATE_PADRAO = "Olá, {nome}!\n\nVocê está convidado(a): *{titulo}* — {data}.\n\nAcesse aqui:\n{link}";

export function getConviteOpenGraphTitle(ev: Pick<EventoPublico, "titulo" | "anfitrioes">): string {
  return ev.titulo.trim() || `Convite — ${nomeDestaque(ev)}`;
}

export function getConviteOpenGraphDescription(
  ev: Pick<EventoPublico, "data" | "localNome">
): string {
  return [formatarDataEvento(ev), ev.localNome].filter(Boolean).join(" · ");
}

/** Substitui {nome} {link} {data} {hora} {titulo} {dias} no modelo do evento. */
export function buildConviteWhatsAppMessage(ev: EventoWhats, link: string, nomeConvidado = ""): string {
  const dias = diasAteEvento(ev);
  const valores: Record<string, string> = {
    nome: nomeConvidado.trim().split(/\s+/)[0] || "",
    link,
    data: formatarDataEvento(ev),
    hora: formatarHoraEvento(ev),
    titulo: ev.titulo || nomeDestaque(ev),
    dias: dias == null ? "" : String(dias),
  };
  const template = ev.whatsappTemplate.trim() || TEMPLATE_PADRAO;
  const texto = template.replace(/\{(\w+)\}/g, (m, k: string) => (k in valores ? valores[k] : m));
  return texto.includes(link) ? texto : `${texto}\n\n${link}`;
}

export function buildConviteWhatsAppUrl(ev: EventoWhats, link: string, nomeConvidado?: string): string {
  const text = encodeURIComponent(buildConviteWhatsAppMessage(ev, link, nomeConvidado));
  return `https://api.whatsapp.com/send?text=${text}`;
}
