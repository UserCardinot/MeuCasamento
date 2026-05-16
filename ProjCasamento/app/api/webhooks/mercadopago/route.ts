import { NextRequest, NextResponse } from "next/server";
import { registrarPagamentoMercadoPago } from "@/lib/mercadopago-registrar-pagamento";

export const dynamic = "force-dynamic";

function extractPaymentIdFromWebhookBody(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;

  const data = o.data;
  const dataId =
    data && typeof data === "object" && (data as Record<string, unknown>).id != null
      ? String((data as Record<string, unknown>).id)
      : null;

  const type = typeof o.type === "string" ? o.type : "";
  const action = typeof o.action === "string" ? o.action : "";
  const topic = typeof o.topic === "string" ? o.topic : "";

  if (dataId && (type === "payment" || topic === "payment" || action.startsWith("payment."))) {
    return dataId;
  }

  if (o.id != null && (type === "payment" || topic === "payment")) {
    return String(o.id);
  }

  return null;
}

async function processPaymentNotification(id: string, origem: string) {
  const result = await registrarPagamentoMercadoPago(id);
  if (!result.ok) {
    console.warn(`Webhook MP (${origem}):`, result.erro, id);
  } else if (!result.jaRegistrado) {
    console.info(`Webhook MP (${origem}): registrado`, id);
  }
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
      await processPaymentNotification(id, "POST");
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
    const id =
      request.nextUrl.searchParams.get("id") ||
      request.nextUrl.searchParams.get("data.id");
    if (topic === "payment" && id) {
      await processPaymentNotification(id, "GET");
    }
    return new NextResponse("OK", { status: 200 });
  } catch (e) {
    console.error("Webhook MP GET:", e);
    return new NextResponse("ERR", { status: 500 });
  }
}
