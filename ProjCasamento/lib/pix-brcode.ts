import { EVENTO } from "@/lib/evento";

export type PixRecebedorConfig = {
  chave: string;
  nome: string;
  cidade: string;
};

/** Remove acentos e limita tamanho (regras do Pix). */
export function normalizePixText(text: string, maxLen: number): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLen);
}

function emvTag(id: string, value: string): string {
  const len = value.length.toString().padStart(2, "0");
  return `${id}${len}${value}`;
}

function crc16(payload: string): string {
  let crc = 0xffff;
  const polynomial = 0x1021;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ polynomial) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function parseEmvTlv(payload: string): Record<string, string> {
  const out: Record<string, string> = {};
  let i = 0;
  while (i + 4 <= payload.length) {
    const id = payload.substring(i, i + 2);
    const len = Number.parseInt(payload.substring(i + 2, i + 4), 10);
    if (!Number.isFinite(len) || len < 0 || i + 4 + len > payload.length) break;
    out[id] = payload.substring(i + 4, i + 4 + len);
    i += 4 + len;
  }
  return out;
}

/** Extrai chave, nome e cidade de um Pix copia e cola estático já existente. */
export function parsePixFromCopiaCola(copiaCola: string): PixRecebedorConfig | null {
  const trimmed = copiaCola.trim();
  const crcIndex = trimmed.lastIndexOf("6304");
  const main = crcIndex >= 0 ? trimmed.substring(0, crcIndex + 4) : trimmed;
  const root = parseEmvTlv(main);
  const mai = root["26"];
  const nome = root["59"];
  const cidade = root["60"];
  if (!mai || !nome || !cidade) return null;
  const pix = parseEmvTlv(mai);
  const chave = pix["01"];
  if (!chave) return null;
  return { chave, nome, cidade };
}

export function getPixRecebedorConfig(): PixRecebedorConfig | null {
  const chaveEnv = process.env.PIX_CHAVE?.trim();
  const nomeEnv = process.env.PIX_RECEBEDOR_NOME?.trim();
  const cidadeEnv = process.env.PIX_CIDADE?.trim();
  const nomePadrao = `${EVENTO.noivos.primeiro} e ${EVENTO.noivos.segundo}`;
  const cidadePadrao = EVENTO.local.cidade;

  if (chaveEnv) {
    return {
      chave: chaveEnv,
      nome: normalizePixText(nomeEnv || nomePadrao, 25),
      cidade: normalizePixText(cidadeEnv || cidadePadrao, 15),
    };
  }

  const copia = process.env.PIX_COPIA_COLA?.trim();
  if (copia) return parsePixFromCopiaCola(copia);

  return null;
}

/**
 * Gera Pix copia e cola com valor fixo (QR dinâmico).
 * O valor no app do banco não pode ser alterado pelo pagador.
 */
export function createPixCopiaColaComValor(
  config: PixRecebedorConfig,
  valor: number,
  txid?: string
): string {
  if (!Number.isFinite(valor) || valor <= 0) {
    throw new Error("Valor do Pix inválido");
  }

  const chave = config.chave.trim();
  const nome = normalizePixText(config.nome, 25);
  const cidade = normalizePixText(config.cidade, 15);
  const valorStr = valor.toFixed(2);

  const pixMerchant = emvTag("00", "br.gov.bcb.pix") + emvTag("01", chave);
  const txidNorm = (txid || `cas${Date.now().toString(36)}`)
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 25);

  let payload =
    emvTag("00", "01") +
    emvTag("01", "12") +
    emvTag("26", pixMerchant) +
    emvTag("52", "0000") +
    emvTag("53", "986") +
    emvTag("54", valorStr) +
    emvTag("58", "BR") +
    emvTag("59", nome) +
    emvTag("60", cidade) +
    emvTag("62", emvTag("05", txidNorm));

  payload += "6304";
  return payload + crc16(payload);
}
