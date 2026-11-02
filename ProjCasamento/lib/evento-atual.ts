import { headers } from "next/headers";
import { eq, or } from "drizzle-orm";
import { getDb, schema } from "@/db";
import type { Evento } from "@/db/schema";
import type { EventoPublico } from "@/lib/evento";

const CACHE_MS = 30_000;
const cache = new Map<string, { ev: Evento | null; ate: number }>();

/** Host da requisição atual, sem porta. */
export function hostDaRequisicao(): string {
  const h = headers();
  return (h.get("x-forwarded-host") || h.get("host") || "")
    .split(",")[0]
    .trim()
    .toLowerCase()
    .replace(/:\d+$/, "");
}

/**
 * Em dev: `localhost` usa DEV_EVENTO_SLUG; `convite-henry.localhost` usa o slug do subdomínio.
 * Em produção: casa pelo domínio completo ou pelo primeiro rótulo do host = slug.
 */
function chaveDoHost(host: string): { dominio: string; slug: string } {
  if (host === "localhost" || host === "127.0.0.1" || !host) {
    return { dominio: host, slug: process.env.DEV_EVENTO_SLUG?.trim() || "" };
  }
  return { dominio: host, slug: host.split(".")[0] };
}

export async function getEventoPorHost(host: string): Promise<Evento | null> {
  const agora = Date.now();
  const hit = cache.get(host);
  if (hit && hit.ate > agora) return hit.ev;

  const { dominio, slug } = chaveDoHost(host);
  const ev =
    (await getDb().query.eventos.findFirst({
      where: or(eq(schema.eventos.dominio, dominio), eq(schema.eventos.slug, slug)),
    })) ?? null;
  const ativo = ev && ev.ativo ? ev : null;
  cache.set(host, { ev: ativo, ate: agora + CACHE_MS });
  return ativo;
}

export async function getEventoAtual(): Promise<Evento | null> {
  return getEventoPorHost(hostDaRequisicao());
}

export function limparCacheEventos(): void {
  cache.clear();
}

export function toEventoPublico(ev: Evento): EventoPublico {
  return {
    id: ev.id,
    slug: ev.slug,
    tipo: ev.tipo === "so_presentes" ? "so_presentes" : "convite_completo",
    tema: ev.tema,
    titulo: ev.titulo,
    anfitrioes: ev.anfitrioes,
    data: ev.data,
    hora: ev.hora,
    localNome: ev.localNome,
    localEndereco: ev.localEndereco,
    localCidade: ev.localCidade,
    localMapUrl: ev.localMapUrl,
    mensagemConvite: ev.mensagemConvite,
    textoCapa: ev.textoCapa,
    whatsappTemplate: ev.whatsappTemplate,
    pixChave: ev.pixChave,
    pixNome: ev.pixNome,
  };
}

/** URL pública base do evento (https://<host>). */
export function baseUrlDoEvento(ev: Evento): string {
  const host = hostDaRequisicao();
  if (host === "localhost" || host === "127.0.0.1" || host.endsWith(".localhost")) {
    const h = headers();
    const proto = h.get("x-forwarded-proto") || "http";
    return `${proto}://${h.get("host")}`;
  }
  return `https://${ev.dominio}`;
}
