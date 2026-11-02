/**
 * Dados públicos do evento usados nas páginas (sem segredos).
 * Seguro para importar em componentes cliente.
 */
export type EventoPublico = {
  id: number;
  slug: string;
  tipo: "convite_completo" | "so_presentes";
  tema: string;
  titulo: string;
  anfitrioes: string;
  data: string;
  hora: string;
  localNome: string;
  localEndereco: string;
  localCidade: string;
  localMapUrl: string;
  mensagemConvite: string;
  textoCapa: string;
  whatsappTemplate: string;
  pixChave: string;
  pixNome: string;
  prazoConfirmacao: string;
  listaPresentes: boolean;
};

const TZ = "America/Sao_Paulo";

function dataValida(ev: Pick<EventoPublico, "data">): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(ev.data);
}

/** "Sábado, 26 de setembro de 2026" */
export function formatarDataEvento(ev: Pick<EventoPublico, "data">): string {
  if (!dataValida(ev)) return "";
  const d = new Date(`${ev.data}T12:00:00-03:00`);
  const txt = d.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: TZ,
  });
  return txt.charAt(0).toUpperCase() + txt.slice(1);
}

/** "08h30" */
export function formatarHoraEvento(ev: Pick<EventoPublico, "hora">): string {
  const m = ev.hora.match(/^(\d{1,2}):(\d{2})/);
  if (!m) return "";
  return `${m[1].padStart(2, "0")}h${m[2]}`;
}

/** "26/09/2026" */
export function formatarDataCurta(ev: Pick<EventoPublico, "data">): string {
  if (!dataValida(ev)) return "";
  const [y, mo, d] = ev.data.split("-");
  return `${d}/${mo}/${y}`;
}

/** Linha única estilo convite impresso, em maiúsculas. */
export function getDataHoraConviteUppercase(ev: Pick<EventoPublico, "data" | "hora">): string {
  const data = formatarDataEvento(ev).toUpperCase();
  const hora = formatarHoraEvento(ev).toUpperCase();
  if (!data) return "";
  return hora ? `${data} ÀS ${hora}` : data;
}

/** Data/hora do evento em ms (contagem regressiva). 0 se não configurada. */
export function getEventoTimestamp(ev: Pick<EventoPublico, "data" | "hora">): number {
  if (!dataValida(ev)) return 0;
  const hora = /^\d{1,2}:\d{2}$/.test(ev.hora) ? ev.hora.padStart(5, "0") : "12:00";
  return new Date(`${ev.data}T${hora}:00-03:00`).getTime();
}

/** Dias civis até o evento (fuso de São Paulo). */
export function diasAteEvento(ev: Pick<EventoPublico, "data">, agora = new Date()): number | null {
  if (!dataValida(ev)) return null;
  const hoje = agora.toLocaleDateString("en-CA", { timeZone: TZ });
  const start = new Date(`${hoje}T12:00:00`);
  const end = new Date(`${ev.data}T12:00:00`);
  return Math.round((end.getTime() - start.getTime()) / 86_400_000);
}

/** "25/11/2026", ou "" sem prazo. */
export function formatarPrazoConfirmacao(ev: Pick<EventoPublico, "prazoConfirmacao">): string {
  return formatarDataCurta({ data: ev.prazoConfirmacao });
}

/** Prazo vale até o fim do dia (fuso de São Paulo). */
export function prazoConfirmacaoEncerrado(
  ev: Pick<EventoPublico, "prazoConfirmacao">,
  agora = new Date()
): boolean {
  if (!dataValida({ data: ev.prazoConfirmacao })) return false;
  const hoje = agora.toLocaleDateString("en-CA", { timeZone: TZ });
  return hoje > ev.prazoConfirmacao;
}

/** Texto curto para títulos: "Henry" ou "Ediane & Fulano", com fallback no título. */
export function nomeDestaque(ev: Pick<EventoPublico, "anfitrioes" | "titulo">): string {
  return ev.anfitrioes.trim() || ev.titulo.trim();
}

/** Formata data/hora de registros (timestamps do banco) para o painel. */
export function formatarDataHoraRegistro(d: Date | string | null | undefined): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString("pt-BR", { timeZone: TZ });
}
