import { NextRequest, NextResponse } from "next/server";
import { exigirAdmin } from "@/lib/admin-sessao";
import { registrarPagamentoMercadoPago } from "@/lib/mercadopago-registrar-pagamento";

export const dynamic = "force-dynamic";

/** Registra um pagamento MP já aprovado (ex.: pagamento que caiu mas não voltou ao site). */
export async function POST(request: NextRequest) {
  const admin = await exigirAdmin();
  if (admin instanceof NextResponse) return admin;

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

  const result = await registrarPagamentoMercadoPago(admin.evento, {
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
