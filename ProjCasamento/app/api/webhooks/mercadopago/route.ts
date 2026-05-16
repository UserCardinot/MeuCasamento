import { NextRequest, NextResponse } from "next/server";
import { registrarPagamentoMercadoPago } from "@/lib/mercadopago-registrar-pagamento";

export const dynamic = "force-dynamic";

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
      const result = await registrarPagamentoMercadoPago(id);
      if (!result.ok) {
        console.warn("Webhook MP:", result.erro, id);
      }
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
      const result = await registrarPagamentoMercadoPago(id);
      if (!result.ok) {
        console.warn("Webhook MP GET:", result.erro, id);
      }
    }
    return new NextResponse("OK", { status: 200 });
  } catch (e) {
    console.error("Webhook MP GET:", e);
    return new NextResponse("ERR", { status: 500 });
  }
}
