import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

function chave(): Buffer {
  const raw = process.env.APP_ENCRYPTION_KEY?.trim();
  if (!raw) throw new Error("APP_ENCRYPTION_KEY não configurada.");
  return createHash("sha256").update(raw).digest();
}

/** AES-256-GCM. Formato: v1:<iv b64>:<tag b64>:<dados b64> */
export function cifrar(texto: string): string {
  if (!texto) return "";
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", chave(), iv);
  const dados = Buffer.concat([cipher.update(texto, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString("base64")}:${tag.toString("base64")}:${dados.toString("base64")}`;
}

export function decifrar(valor: string): string {
  if (!valor) return "";
  const [v, ivB64, tagB64, dadosB64] = valor.split(":");
  if (v !== "v1" || !ivB64 || !tagB64 || !dadosB64) return "";
  try {
    const decipher = createDecipheriv("aes-256-gcm", chave(), Buffer.from(ivB64, "base64"));
    decipher.setAuthTag(Buffer.from(tagB64, "base64"));
    return Buffer.concat([
      decipher.update(Buffer.from(dadosB64, "base64")),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    return "";
  }
}
