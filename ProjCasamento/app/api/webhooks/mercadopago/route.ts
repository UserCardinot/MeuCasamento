import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { appendToSheet, readFromSheet } from "@/lib/google";
import { parseExternalReference } from "@/lib/mercadopago-shared";

export const dynamic = "force-dynamic";

async function paymentAlreadyLogged(sheetId: string, paymentId: string): Promise<boolean> {
  try {
    const col = await readFromSheet(sheetId, "Presentes!E2:E2000");
    return col.some((row) => String(row[0] ?? "").trim() === paymentId);
  } catch {
    return false;
  }
}

async function processPaymentId(paymentId: string): Promise<void> {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!accessToken || !sheetId) {
    console.error("Webhook MP: MERCADOPAGO_ACCESS_TOKEN ou GOOGLE_SHEET_ID ausente");
    return;
  }

  const client = new MercadoPagoConfig({ accessToken });
  const paymentApi = new Payment(client);
  let pay: Awaited<ReturnType<Payment["get"]>>;
  try {
    pay = await paymentApi.get({ id: paymentId });
  } catch {
    console.warn("Webhook MP: pagamento não encontrado ou erro na API", paymentId);
    return;
  }

  if (pay.status !== "approved") {
    return;
  }

  if (await paymentAlreadyLogged(sheetId, String(paymentId))) {
    return;
  }

  const parsed = parseExternalReference(pay.external_reference);
  if (!parsed) {
    console.error("Webhook MP: external_reference inválido", pay.id);
    return;
  }

  const { token, presente } = parsed;
  const amount = pay.transaction_amount;
  if (typeof amount !== "number" || !Number.isFinite(amount)) {
    console.error("Webhook MP: transaction_amount inválido", pay.id);
    return;
  }

  const valor = amount.toFixed(2).replace(".", ",");
  const data = new Date().toLocaleString("pt-BR");

  await appendToSheet(sheetId, "Presentes!A:E", [
    [token, `${presente.trim()} (cartão)`, valor, data, String(paymentId)],
  ]);
}

function extractPaymentIdFromWebhookBody(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;
  const data = o.data;
  if (data && typeof data === "object") {
    const id = (data as Record<string, unknown>).id;
    if (id !== undefined && id !== null) return String(id);
  }
  if (o.id !== undefined && o.id !== null && (o.type === "payment" || o.topic === "payment")) {
    return String(o.id);
  }
  return null;
}

/** Notificações do Mercado Pago (POST JSON ou GET estilo IPN) */
export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return new NextResponse(null, { status: 400 });
    }

    const id = extractPaymentIdFromWebhookBody(body);
    if (id) {
      await processPaymentId(id);
    }
    return new NextResponse(null, { status: 200 });
  } catch (e) {
    console.error("Webhook MP POST:", e);
    return new NextResponse(null, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const topic = request.nextUrl.searchParams.get("topic");
    const id = request.nextUrl.searchParams.get("id") || request.nextUrl.searchParams.get("data.id");
    if (topic === "payment" && id) {
      await processPaymentId(id);
    }
    return new NextResponse("OK", { status: 200 });
  } catch (e) {
    console.error("Webhook MP GET:", e);
    return new NextResponse("ERR", { status: 500 });
  }
}
