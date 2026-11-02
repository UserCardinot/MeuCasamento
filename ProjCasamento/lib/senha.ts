import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const KEYLEN = 64;

/** Formato: scrypt$<salt hex>$<hash hex> */
export function hashSenha(senha: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(senha, salt, KEYLEN);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export function verificarSenha(senha: string, armazenado: string): boolean {
  const [alg, saltHex, hashHex] = armazenado.split("$");
  if (alg !== "scrypt" || !saltHex || !hashHex) return false;
  const esperado = Buffer.from(hashHex, "hex");
  const calculado = scryptSync(senha, Buffer.from(saltHex, "hex"), esperado.length);
  return calculado.length === esperado.length && timingSafeEqual(calculado, esperado);
}
