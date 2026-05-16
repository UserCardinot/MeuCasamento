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
  | { ok: true; jaRegistrado: boolean }
  | { ok: false; erro: string };

/** Grava presente na planilha quando o pagamento MP está aprovado (webhook ou retorno do checkout). */
export async function registrarPagamentoMercadoPago(
  paymentId: string
): Promise<RegistrarPagamentoResult> {
  const id = paymentId.trim();
  if (!id) return { ok: false, erro: "ID do pagamento inválido" };

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
    return { ok: true, jaRegistrado: true };
  }

  const parsed = parseExternalReference(pay.external_reference);
  if (!parsed) {
    console.error("MP registrar: external_reference inválido", pay.id);
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
    return { ok: true, jaRegistrado: false };
  } catch (e) {
    console.error("MP registrar: erro ao gravar planilha", e);
    return { ok: false, erro: "Erro ao salvar na planilha" };
  }
}
