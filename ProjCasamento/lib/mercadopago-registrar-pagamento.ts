import { MercadoPagoConfig, Payment } from "mercadopago";
import { appendToSheet, readFromSheet } from "@/lib/google";
import { formatPresentesRegistro } from "@/lib/presentes-checkout";
import { parseExternalReference } from "@/lib/mercadopago-shared";

async function paymentAlreadyLogged(sheetId: string, paymentId: string): Promise<boolean> {
  try {
    const col = await readFromSheet(sheetId, "Presentes!E2:E2000");
    return col.some((row) => String(row[0] ?? "").trim() === paymentId);
  } catch {
    return false;
  }
}

export type RegistrarPagamentoResult =
  | { ok: true; jaRegistrado: boolean; paymentId: string }
  | { ok: false; erro: string };

export type ResolverPagamentoInput = {
  paymentId?: string;
  externalReference?: string;
};

/** Busca ID de pagamento aprovado por external_reference (retorno MP sem payment_id). */
export async function resolverPaymentIdAprovado(
  input: ResolverPagamentoInput
): Promise<string | null> {
  const direct = input.paymentId?.trim();
  if (direct) return direct;

  const ref = input.externalReference?.trim();
  if (!ref) return null;

  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim();
  if (!accessToken) return null;

  try {
    const url = new URL("https://api.mercadopago.com/v1/payments/search");
    url.searchParams.set("sort", "date_created");
    url.searchParams.set("criteria", "desc");
    url.searchParams.set("external_reference", ref);
    url.searchParams.set("status", "approved");
    url.searchParams.set("range", "date_created");
    url.searchParams.set("begin_date", "NOW-30DAYS");
    url.searchParams.set("end_date", "NOW");

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (!res.ok) {
      console.warn("MP search payments:", res.status, ref);
      return null;
    }
    const data = (await res.json()) as { results?: { id?: number | string }[] };
    const first = data.results?.[0];
    if (first?.id != null) return String(first.id);
  } catch (e) {
    console.error("MP search payments:", e);
  }
  return null;
}

/** Grava presente na planilha quando o pagamento MP está aprovado (webhook ou retorno do checkout). */
export async function registrarPagamentoMercadoPago(
  paymentIdOrInput: string | ResolverPagamentoInput
): Promise<RegistrarPagamentoResult> {
  const resolvedId =
    typeof paymentIdOrInput === "string"
      ? paymentIdOrInput.trim()
      : await resolverPaymentIdAprovado(paymentIdOrInput);

  const id = resolvedId?.trim();
  if (!id) {
    return {
      ok: false,
      erro: "Pagamento aprovado não encontrado. Use o ID do pagamento no painel do Mercado Pago.",
    };
  }

  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim();
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!accessToken || !sheetId) {
    return { ok: false, erro: "Pagamento não configurado no servidor" };
  }

  const client = new MercadoPagoConfig({ accessToken });
  const paymentApi = new Payment(client);

  let pay: Awaited<ReturnType<Payment["get"]>>;
  try {
    pay = await paymentApi.get({ id });
  } catch {
    return { ok: false, erro: "Pagamento não encontrado no Mercado Pago" };
  }

  if (pay.status !== "approved") {
    return {
      ok: false,
      erro:
        pay.status === "pending"
          ? "Pagamento ainda pendente. Aguarde a confirmação."
          : "Pagamento não aprovado.",
    };
  }

  if (await paymentAlreadyLogged(sheetId, id)) {
    return { ok: true, jaRegistrado: true, paymentId: id };
  }

  const parsed = parseExternalReference(pay.external_reference);
  if (!parsed) {
    console.error("MP registrar: external_reference inválido", pay.id, pay.external_reference);
    return { ok: false, erro: "Referência do presente inválida" };
  }

  const { token, presentes } = parsed;
  const amount = pay.transaction_amount;
  if (typeof amount !== "number" || !Number.isFinite(amount)) {
    return { ok: false, erro: "Valor do pagamento inválido" };
  }

  const valor = amount.toFixed(2).replace(".", ",");
  const data = new Date().toLocaleString("pt-BR");
  const presenteLabel = formatPresentesRegistro(presentes, "cartão");

  try {
    await appendToSheet(sheetId, "Presentes!A:E", [
      [token, presenteLabel, valor, data, id],
    ]);
    return { ok: true, jaRegistrado: false, paymentId: id };
  } catch (e) {
    console.error("MP registrar: erro ao gravar planilha", e);
    return { ok: false, erro: "Erro ao salvar na planilha" };
  }
}
