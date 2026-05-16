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

export function somaPrecosCatalogo(presentes: { preco: string }[]): number | null {
  let total = 0;
  for (const p of presentes) {
    const n = parseCatalogPreco(p.preco);
    if (n == null) return null;
    total += n;
  }
  return Math.round(total * 100) / 100;
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
  itemIdFromTitle: (title: string) => string
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
    mpItems.push({
      id: `${itemIdFromTitle(item.nome)}-${i}`,
      title: `Presente: ${item.nome.slice(0, 200)}`,
      quantity: 1,
      currency_id: "BRL",
      unit_price: amountRes.amount,
    });
  }

  return { items: mpItems };
}

export function formatPrecoBRL(valor: number): string {
  return valor.toFixed(2).replace(".", ",");
}
