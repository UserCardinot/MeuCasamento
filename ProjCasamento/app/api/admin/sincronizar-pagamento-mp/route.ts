import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validateAdminSessionToken } from "@/lib/auth";
import { registrarPagamentoMercadoPago } from "@/lib/mercadopago-registrar-pagamento";

export const dynamic = "force-dynamic";

/** Registra na planilha um pagamento MP já aprovado (ex.: pagamento que caiu mas não voltou ao site). */
export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  if (!session || !validateAdminSessionToken(session)) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  let body: { payment_id?: string; external_reference?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ erro: "Dados inválidos" }, { status: 400 });
  }

  const paymentId = body.payment_id?.trim();
  const externalReference = body.external_reference?.trim();
  if (!paymentId && !externalReference) {
    return NextResponse.json(
      { erro: "Informe o ID do pagamento (número) do Mercado Pago." },
      { status: 400 }
    );
  }

  const result = await registrarPagamentoMercadoPago({
    paymentId,
    externalReference,
  });

  if (!result.ok) {
    return NextResponse.json({ erro: result.erro }, { status: 400 });
  }

  return NextResponse.json({
    sucesso: true,
    jaRegistrado: result.jaRegistrado,
    paymentId: result.paymentId,
  });
}
