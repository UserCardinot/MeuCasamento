import { NextRequest, NextResponse } from "next/server";
import { validateGuestToken } from "@/lib/auth";
import { registrarPagamentoMercadoPago } from "@/lib/mercadopago-registrar-pagamento";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/** Confirma pagamento ao voltar do checkout (localhost e produção). */
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const { allowed } = checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json({ erro: "Muitas tentativas. Aguarde um minuto." }, { status: 429 });
  }

  let body: { token?: string; payment_id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ erro: "Dados inválidos" }, { status: 400 });
  }

  const token = body.token?.trim();
  const paymentId =
    body.payment_id?.trim() ||
    request.nextUrl.searchParams.get("payment_id")?.trim() ||
    request.nextUrl.searchParams.get("collection_id")?.trim();

  if (!token) {
    return NextResponse.json({ erro: "Token obrigatório" }, { status: 400 });
  }
  if (!paymentId) {
    return NextResponse.json({ erro: "ID do pagamento obrigatório" }, { status: 400 });
  }

  if (!(await validateGuestToken(token))) {
    return NextResponse.json({ erro: "Token inválido" }, { status: 401 });
  }

  const result = await registrarPagamentoMercadoPago(paymentId);
  if (!result.ok) {
    return NextResponse.json({ erro: result.erro }, { status: 400 });
  }

  return NextResponse.json({
    sucesso: true,
    jaRegistrado: result.jaRegistrado,
  });
}
