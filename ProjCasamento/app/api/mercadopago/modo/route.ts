import { NextResponse } from "next/server";
import { shouldUseMercadoPagoSandbox } from "@/lib/mercadopago-shared";

export const dynamic = "force-dynamic";

/** Indica se o servidor está em modo sandbox (sem expor o token). */
export async function GET() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim();
  if (!accessToken) {
    return NextResponse.json({ configurado: false, sandbox: false });
  }
  return NextResponse.json({
    configurado: true,
    sandbox: shouldUseMercadoPagoSandbox(accessToken),
  });
}
