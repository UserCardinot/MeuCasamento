/**
 * Validação de tokens e senha admin
 * Token por convidado: validado na aba Convidados (lib/google)
 * EVENT_TOKEN e ADMIN_PASSWORD: variáveis de ambiente
 */

import { createHmac, randomBytes } from "crypto";
import { getConvidadoByToken } from "./google";

/** Valida se o token existe na aba Convidados do Sheets */
export async function validateGuestToken(token: string): Promise<boolean> {
  const convidado = await getConvidadoByToken(token);
  return convidado !== null;
}

export function generateGuestToken(): string {
  return randomBytes(16).toString("hex");
}

export function validateEventToken(token: string): boolean {
  const expected = process.env.EVENT_TOKEN;
  if (!expected) return false;
  return token === expected;
}

/** Aceita eventToken / eventtoken / EventToken na query string. */
export function pickEventTokenParam(
  searchParams: Record<string, string | string[] | undefined> | URLSearchParams
): string | undefined {
  const read = (key: string): string | undefined => {
    if (searchParams instanceof URLSearchParams) {
      const v = searchParams.get(key);
      return v?.trim() || undefined;
    }
    const raw = searchParams[key];
    if (typeof raw === "string") return raw.trim() || undefined;
    if (Array.isArray(raw)) return raw[0]?.toString().trim() || undefined;
    return undefined;
  };

  const direct = read("eventToken") || read("eventtoken") || read("EventToken");
  if (direct) return direct;

  if (searchParams instanceof URLSearchParams) {
    const pairs = Array.from(searchParams.entries());
    for (let i = 0; i < pairs.length; i++) {
      const [k, v] = pairs[i];
      if (k.toLowerCase() === "eventtoken" && v.trim()) return v.trim();
    }
    return undefined;
  }

  const keys = Object.keys(searchParams);
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    if (k.toLowerCase() !== "eventtoken") continue;
    const v = searchParams[k];
    if (typeof v === "string" && v.trim()) return v.trim();
    if (Array.isArray(v) && v[0]) return String(v[0]).trim();
  }
  return undefined;
}

export function validateAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return password === expected;
}

export function createAdminSessionToken(): string {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) throw new Error("ADMIN_PASSWORD não configurado");
  return createHmac("sha256", secret).update("admin_session").digest("hex");
}

export function validateAdminSessionToken(token: string): boolean {
  const expected = createAdminSessionToken();
  return token === expected && token.length > 0;
}
