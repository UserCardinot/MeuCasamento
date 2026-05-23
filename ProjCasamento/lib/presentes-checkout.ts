import { parseCatalogPreco, resolveCheckoutAmount } from "@/lib/mercadopago-shared";

export type PresenteCatalogo = { nome: string; preco: string; url?: string; imagem?: string };

export function normalizePresentesNomes(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of input) {
    if (typeof raw !== "string") continue;
    const nome = raw.trim();
    if (!nome || seen.has(nome)) continue;
    seen.add(nome);
    out.push(nome);
  }
  return out;
}

export function parsePresentesBody(body: {
  presente?: unknown;
  presentes?: unknown;
}): string[] {
  const fromArray = normalizePresentesNomes(body.presentes);
  if (fromArray.length > 0) return fromArray;
  if (typeof body.presente === "string" && body.presente.trim()) {
    return [body.presente.trim()];
  }
  return [];
}

export function formatPresentesRegistro(nomes: string[], sufixo?: string): string {
  const base = nomes.join(" + ");
  return sufixo ? `${base} (${sufixo})` : base;
}

export function arredondarMoedaBRL(valor: number): number {
  return Math.round(valor * 100) / 100;
}

/** Valor a cobrar no cartão para você receber ~`subtotal` após a tarifa percentual. */
export function valorComTaxaCartao(subtotal: number, taxaPercent: number): number {
  if (taxaPercent <= 0 || subtotal <= 0) return arredondarMoedaBRL(subtotal);
  return arredondarMoedaBRL(subtotal / (1 - taxaPercent / 100));
}

export function calcularResumoTaxaCartao(subtotal: number, taxaPercent: number) {
  const base = arredondarMoedaBRL(subtotal);
  const total = valorComTaxaCartao(base, taxaPercent);
  const taxa = arredondarMoedaBRL(total - base);
  return { subtotal: base, taxa, total, taxaPercent };
}

export function somaPrecosCatalogo(presentes: { preco: string }[]): number | null {
  let total = 0;
  for (const p of presentes) {
    const n = parseCatalogPreco(p.preco);
    if (n == null) return null;
    total += n;
  }
  return Math.round(total * 100) / 100;
}

/** Filtro de busca por nome ou preço (aceita "150", "150,00", "R$ 150"). */
export function matchBuscaCatalogoPresente(
  query: string,
  item: { nome: string; preco: string }
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (item.nome.toLowerCase().includes(q)) return true;

  const precoRaw = item.preco.trim();
  if (!precoRaw) return false;

  const precoNorm = precoRaw.toLowerCase().replace(",", ".");
  const qPreco = q.replace(/^r\$\s*/, "").trim();
  if (precoNorm.includes(qPreco)) return true;

  const digitsQ = qPreco.replace(/[^\d.]/g, "");
  if (!digitsQ) return false;
  const digitsP = precoNorm.replace(/[^\d.]/g, "");
  return digitsP.includes(digitsQ);
}

export function resolvePresentesCatalogItems(
  catalog: PresenteCatalogo[],
  nomes: string[]
): { items: PresenteCatalogo[] } | { error: string } {
  if (nomes.length === 0) {
    return { error: "Selecione ao menos um presente." };
  }
  if (nomes.length > 10) {
    return { error: "Selecione no máximo 10 itens por vez." };
  }

  const items: PresenteCatalogo[] = [];
  for (const nome of nomes) {
    const item = catalog.find((p) => p.nome.trim() === nome);
    if (!item) {
      return { error: `Presente não encontrado na lista: ${nome}` };
    }
    items.push(item);
  }
  return { items };
}

export function buildMercadoPagoLineItems(
  catalogItems: PresenteCatalogo[],
  itemIdFromTitle: (title: string) => string,
  taxaCartaoPercent = 0
): { items: { id: string; title: string; quantity: number; currency_id: string; unit_price: number }[] } | { error: string } {
  const mpItems: {
    id: string;
    title: string;
    quantity: number;
    currency_id: string;
    unit_price: number;
  }[] = [];

  for (let i = 0; i < catalogItems.length; i++) {
    const item = catalogItems[i]!;
    const amountRes = resolveCheckoutAmount({ catalogPreco: item.preco });
    if ("error" in amountRes) {
      return {
        error: `O item "${item.nome}" precisa ter preço na lista para pagamento com cartão.`,
      };
    }
    const unitPrice =
      taxaCartaoPercent > 0
        ? valorComTaxaCartao(amountRes.amount, taxaCartaoPercent)
        : amountRes.amount;

    mpItems.push({
      id: `${itemIdFromTitle(item.nome)}-${i}`,
      title: `Presente: ${item.nome.slice(0, 200)}`,
      quantity: 1,
      currency_id: "BRL",
      unit_price: unitPrice,
    });
  }

  return { items: mpItems };
}

export function formatPrecoBRL(valor: number): string {
  return valor.toFixed(2).replace(".", ",");
}
