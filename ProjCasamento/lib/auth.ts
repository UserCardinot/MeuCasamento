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
