/**
 * URLs públicas e formato de external_reference (preferência ↔ pagamento)
 */

function toHttpsBase(hostOrUrl: string): string {
  const trimmed = hostOrUrl.trim().replace(/\/$/, "");
  if (/^https?:\/\//i.test(trimmed)) return trimmed.replace(/\/$/, "");
  return `https://${trimmed.replace(/^https?:\/\//i, "")}`;
}

/** URL pública do site (retorno MP, webhooks). Vercel: defina NEXT_PUBLIC_SITE_URL ou usa *.vercel.app. */
export function getPublicSiteBaseUrl(): string {
  const explicit =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_BASE_URL?.trim();
  if (explicit) return toHttpsBase(explicit);

  const vercelProduction = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercelProduction) return toHttpsBase(vercelProduction);

  const vercelDeploy = process.env.VERCEL_URL?.trim();
  if (vercelDeploy) return toHttpsBase(vercelDeploy);

  return "http://localhost:3000";
}

function isLocalHostname(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return h === "localhost" || h === "127.0.0.1" || h === "[::1]";
}

/**
 * Base URL para back_urls da preferência.
 * Em dev no localhost, ignora NEXT_PUBLIC_SITE_URL (evita misturar TEST + URL do Vercel).
 */
export function getCheckoutBaseUrl(request?: { headers: Headers }): string {
  const host =
    request?.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    request?.headers.get("host")?.trim();
  if (host && process.env.NODE_ENV === "development") {
    const hostname = host.split(":")[0];
    if (isLocalHostname(hostname)) {
      const proto =
        request?.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || "http";
      return `${proto}://${host}`.replace(/\/$/, "");
    }
  }
  return getPublicSiteBaseUrl();
}

/** Legado: alguns tokens antigos começam com TEST- */
export function isMercadoPagoTestToken(accessToken: string): boolean {
  return accessToken.trim().startsWith("TEST-");
}

/**
 * Sandbox (checkout de teste): MERCADOPAGO_SANDBOX=true no .env.local.
 * Teste e produção no painel MP usam APP_USR- — a flag evita confusão.
 */
/** ID numérico do vendedor no final do Access Token (ex.: ...-3373866106). */
export function mercadoPagoCollectorIdFromAccessToken(accessToken: string): string | null {
  const m = accessToken.trim().match(/-(\d+)$/);
  return m?.[1] ?? null;
}

export function mercadoPagoCollectorIdFromPreferenceId(preferenceId: string | undefined): string | null {
  if (!preferenceId?.trim()) return null;
  const m = preferenceId.trim().match(/^(\d+)-/);
  return m?.[1] ?? null;
}

/**
 * Percentual embutido no checkout com cartão (repasse da tarifa MP).
 * MERCADOPAGO_TAXA_PERCENT=0 desativa. Padrão: 5.
 */
export function getMercadoPagoTaxaCartaoPercent(): number {
  const raw = process.env.MERCADOPAGO_TAXA_PERCENT?.trim();
  if (raw === "0" || raw?.toLowerCase() === "false") return 0;
  if (raw) {
    const n = Number(String(raw).replace(",", "."));
    if (Number.isFinite(n) && n >= 0 && n < 50) return Math.round(n * 100) / 100;
  }
  return 5;
}

export function shouldUseMercadoPagoSandbox(accessToken: string): boolean {
  const flag = process.env.MERCADOPAGO_SANDBOX?.trim().toLowerCase();
  if (flag === "true" || flag === "1" || flag === "yes") return true;
  if (flag === "false" || flag === "0" || flag === "no") return false;
  return isMercadoPagoTestToken(accessToken);
}

export function resolveMercadoPagoInitPoint(
  result: { init_point?: string | null; sandbox_init_point?: string | null },
  sandbox: boolean
): string | undefined {
  if (sandbox) {
    // Nunca usar init_point de produção no modo teste (gera "uma das partes é de teste")
    return result.sandbox_init_point ?? undefined;
  }
  return result.init_point ?? undefined;
}

export function isMercadoPagoSandboxCheckoutUrl(url: string): boolean {
  try {
    return new URL(url).hostname.includes("sandbox.mercadopago");
  } catch {
    return false;
  }
}

/** MP só aceita auto_return com back_urls.success em HTTPS público (não localhost). */
export function canUseMercadoPagoAutoReturn(baseUrl: string): boolean {
  try {
    const u = new URL(baseUrl);
    if (u.protocol !== "https:") return false;
    const host = u.hostname.toLowerCase();
    return host !== "localhost" && host !== "127.0.0.1" && !host.endsWith(".local");
  } catch {
    return false;
  }
}

export function formatMercadoPagoApiError(err: unknown): string {
  if (err && typeof err === "object") {
    const o = err as Record<string, unknown>;
    const code = typeof o.code === "string" ? o.code : "";
    if (code === "PA_UNAUTHORIZED_RESULT_FROM_POLICIES") {
      return (
        "Token do Mercado Pago recusado (credencial inválida ou política da conta). " +
        "No localhost: use Access Token de teste (TEST-...) das Credenciais de teste, sem NEXT_PUBLIC_SITE_URL no .env.local, " +
        "e não use a Public Key no lugar do token."
      );
    }
    if (typeof o.message === "string" && o.message.trim()) return o.message.trim();
    if (Array.isArray(o.cause) && o.cause[0] && typeof o.cause[0] === "object") {
      const c0 = o.cause[0] as Record<string, unknown>;
      if (typeof c0.description === "string") return c0.description;
      if (typeof c0.message === "string") return c0.message;
    }
  }
  return "Erro ao criar pagamento. Tente novamente.";
}

const SEP = "|";

function encodePresentesPayload(presentes: string[]): string {
  const list = presentes.map((p) => p.trim()).filter(Boolean);
  if (list.length === 0) throw new Error("Nenhum presente informado");
  const json = list.length === 1 ? list[0]! : JSON.stringify(list);
  return Buffer.from(json, "utf8").toString("base64url");
}

function decodePresentesPayload(decoded: string): string[] {
  const t = decoded.trim();
  if (!t) return [];
  if (t.startsWith("[")) {
    const arr = JSON.parse(t) as unknown;
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
      .map((x) => x.trim());
  }
  return [t];
}

/** Limite do MP para external_reference em preferências (1 ou vários presentes). */
export function buildExternalReference(token: string, presente: string | string[]): string {
  const list = Array.isArray(presente) ? presente : [presente];
  const payload = encodePresentesPayload(list);
  const ref = `${token.trim()}${SEP}${payload}`;
  if (ref.length > 256) {
    throw new Error("Muitos itens selecionados. Escolha menos presentes por pagamento.");
  }
  return ref;
}

export function parseExternalReference(ref: string | undefined): {
  token: string;
  presentes: string[];
  /** Primeiro item — compatível com código legado */
  presente: string;
} | null {
  if (!ref || typeof ref !== "string") return null;
  const i = ref.indexOf(SEP);
  if (i <= 0 || i >= ref.length - 1) return null;
  const token = ref.slice(0, i).trim();
  const enc = ref.slice(i + 1);
  try {
    const decoded = Buffer.from(enc, "base64url").toString("utf8");
    const presentes = decodePresentesPayload(decoded);
    if (!token || presentes.length === 0) return null;
    return { token, presentes, presente: presentes[0]! };
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
