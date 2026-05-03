/**
 * URLs públicas e formato de external_reference (preferência ↔ pagamento)
 */

export function getPublicSiteBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_BASE_URL?.trim() ||
    (process.env.VERCEL_URL?.trim()
      ? `https://${process.env.VERCEL_URL.replace(/^https?:\/\//i, "")}`
      : "") ||
    "http://localhost:3000";
  return raw.replace(/\/$/, "");
}

const SEP = "|";

/** Limite do MP para external_reference em preferências */
export function buildExternalReference(token: string, presente: string): string {
  const payload = Buffer.from(presente.trim(), "utf8").toString("base64url");
  const ref = `${token.trim()}${SEP}${payload}`;
  if (ref.length > 256) {
    throw new Error("Dados do presente excedem o limite para o checkout");
  }
  return ref;
}

export function parseExternalReference(ref: string | undefined): {
  token: string;
  presente: string;
} | null {
  if (!ref || typeof ref !== "string") return null;
  const i = ref.indexOf(SEP);
  if (i <= 0 || i >= ref.length - 1) return null;
  const token = ref.slice(0, i).trim();
  const enc = ref.slice(i + 1);
  try {
    const presente = Buffer.from(enc, "base64url").toString("utf8");
    if (!token || !presente.trim()) return null;
    return { token, presente };
  } catch {
    return null;
  }
}

export function parseCatalogPreco(preco: string | undefined): number | null {
  if (!preco?.trim()) return null;
  const n = Number(String(preco).trim().replace(",", "."));
  return Number.isFinite(n) && n >= 0.01 ? n : null;
}

/** Mesma ideia do registrar-pix: dígitos opcionais (ex.: "15000" → 150) */
export function parseValorOpcionalInput(valor: string | undefined): number | null {
  if (!valor?.trim()) return null;
  const digits = valor.replace(/\D/g, "");
  if (!digits) return null;
  let n: number;
  if (digits.length > 2) {
    n = Number(digits) / 100;
  } else {
    n = Number(digits);
  }
  return Number.isFinite(n) && n >= 0.01 ? Math.round(n * 100) / 100 : null;
}

/**
 * Valor cobrado: mínimo o preço do catálogo (se existir); pode subir se o usuário informar valor maior.
 */
export function resolveCheckoutAmount(opts: {
  catalogPreco: string | undefined;
  valorDigitado?: string;
}): { amount: number } | { error: string } {
  const catalog = parseCatalogPreco(opts.catalogPreco);
  const dig = parseValorOpcionalInput(opts.valorDigitado);
  let amount: number;
  if (catalog != null && dig != null) {
    amount = Math.max(catalog, dig);
  } else if (catalog != null) {
    amount = catalog;
  } else if (dig != null) {
    amount = dig;
  } else {
    return { error: "Informe um valor ou escolha um presente com preço na lista." };
  }
  if (amount < 1) {
    return { error: "Valor mínimo para o checkout é R$ 1,00." };
  }
  amount = Math.round(amount * 100) / 100;
  return { amount };
}
