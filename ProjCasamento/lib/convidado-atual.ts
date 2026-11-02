import type { Convidado, Evento } from "@/db/schema";
import { getEventoAtual } from "@/lib/evento-atual";
import { getConvidado } from "@/lib/repo/convidados";

/** Evento do domínio + convidado do token (null se qualquer um não existir). */
export async function resolverConvidado(
  token: string | undefined | null
): Promise<{ evento: Evento; convidado: Convidado } | null> {
  const t = token?.toString().trim();
  if (!t) return null;
  const evento = await getEventoAtual();
  if (!evento) return null;
  const convidado = await getConvidado(evento.id, t);
  if (!convidado) return null;
  return { evento, convidado };
}

export function pickParam(v: string | string[] | undefined): string {
  if (v === undefined) return "";
  return (Array.isArray(v) ? v[0] : v)?.toString().trim() ?? "";
}
