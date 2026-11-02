import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import type { Evento, Usuario } from "@/db/schema";
import { getEventoAtual } from "@/lib/evento-atual";

export const COOKIE_SESSAO = "admin_sessao";
export const SESSAO_DURACAO_S = 60 * 60 * 24 * 7;

function segredo(): string {
  const s = process.env.SESSION_SECRET?.trim();
  if (!s) throw new Error("SESSION_SECRET não configurado.");
  return s;
}

function assinar(payload: string): string {
  return createHmac("sha256", segredo()).update(payload).digest("base64url");
}

export function criarValorSessao(usuarioId: number): string {
  const exp = Math.floor(Date.now() / 1000) + SESSAO_DURACAO_S;
  const payload = Buffer.from(JSON.stringify({ uid: usuarioId, exp })).toString("base64url");
  return `${payload}.${assinar(payload)}`;
}

function lerValorSessao(valor: string | undefined): number | null {
  if (!valor) return null;
  const [payload, assinatura] = valor.split(".");
  if (!payload || !assinatura) return null;
  const esperado = Buffer.from(assinar(payload));
  const recebido = Buffer.from(assinatura);
  if (esperado.length !== recebido.length || !timingSafeEqual(esperado, recebido)) return null;
  try {
    const { uid, exp } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (typeof uid !== "number" || typeof exp !== "number" || exp < Date.now() / 1000) return null;
    return uid;
  } catch {
    return null;
  }
}

export function podeAdministrar(usuario: Usuario, evento: Evento): boolean {
  return usuario.papel === "super" || usuario.eventoId === evento.id;
}

export type AdminAtual = { usuario: Usuario; evento: Evento };

/** Usuário logado com permissão no evento do domínio atual. */
export async function getAdminAtual(): Promise<AdminAtual | null> {
  const uid = lerValorSessao(cookies().get(COOKIE_SESSAO)?.value);
  if (!uid) return null;
  const [usuario, evento] = await Promise.all([
    getDb().query.usuarios.findFirst({ where: eq(schema.usuarios.id, uid) }),
    getEventoAtual(),
  ]);
  if (!usuario || !evento || !podeAdministrar(usuario, evento)) return null;
  return { usuario, evento };
}

/** Para rotas de API: devolve o admin ou uma resposta 401 pronta. */
export async function exigirAdmin(): Promise<AdminAtual | NextResponse> {
  const admin = await getAdminAtual();
  if (!admin) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  return admin;
}

export async function exigirSuper(): Promise<AdminAtual | NextResponse> {
  const admin = await getAdminAtual();
  if (!admin || admin.usuario.papel !== "super") {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }
  return admin;
}

export function cookieSessaoOpcoes() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: SESSAO_DURACAO_S,
    path: "/",
  };
}
