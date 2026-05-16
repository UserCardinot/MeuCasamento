import { NextResponse } from "next/server";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";

/** Dados públicos do Pix para exibir QR e chave na lista de presentes */
export async function GET() {
  const pixCopiaCola = process.env.PIX_COPIA_COLA;
  const pixChave = process.env.PIX_CHAVE?.trim() || null;

  if (!pixCopiaCola) {
    return NextResponse.json({ configurado: false });
  }

  const qrDataUrl = await QRCode.toDataURL(pixCopiaCola, { width: 220, margin: 2 });
  return NextResponse.json({ configurado: true, qrDataUrl, chave: pixChave });
}
