import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import {
  createPixCopiaColaComValor,
  getPixRecebedorConfig,
  parsePixFromCopiaCola,
} from "@/lib/pix-brcode";

export const dynamic = "force-dynamic";

function parseValorBody(body: unknown): number | null {
  if (!body || typeof body !== "object") return null;
  const v = (body as { valor?: unknown }).valor;
  if (typeof v === "number" && Number.isFinite(v) && v > 0) return Math.round(v * 100) / 100;
  if (typeof v === "string" && v.trim()) {
    const n = Number(v.replace(",", "."));
    if (Number.isFinite(n) && n > 0) return Math.round(n * 100) / 100;
  }
  return null;
}

/** Pix estático (sem valor fixo) — compatibilidade. */
export async function GET() {
  const pixCopiaCola = process.env.PIX_COPIA_COLA?.trim();
  const pixChave = process.env.PIX_CHAVE?.trim() || null;

  if (!pixCopiaCola) {
    return NextResponse.json({ configurado: false });
  }

  const qrDataUrl = await QRCode.toDataURL(pixCopiaCola, { width: 220, margin: 2 });
  return NextResponse.json({
    configurado: true,
    qrDataUrl,
    chave: pixChave ?? parsePixFromCopiaCola(pixCopiaCola)?.chave ?? null,
    valorFixo: false,
  });
}

/** Pix com valor do carrinho (QR com valor fixo). */
export async function POST(request: NextRequest) {
  const config = getPixRecebedorConfig();
  if (!config) {
    return NextResponse.json({ configurado: false });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ erro: "Dados inválidos" }, { status: 400 });
  }

  const valor = parseValorBody(body);
  if (valor == null) {
    return NextResponse.json(
      {
        configurado: true,
        erro: "Informe o valor do carrinho para gerar o Pix.",
        valorObrigatorio: true,
      },
      { status: 400 }
    );
  }

  try {
    const copiaCola = createPixCopiaColaComValor(config, valor);
    const qrDataUrl = await QRCode.toDataURL(copiaCola, { width: 220, margin: 2 });
    return NextResponse.json({
      configurado: true,
      qrDataUrl,
      chave: config.chave,
      copiaCola,
      valor: valor.toFixed(2),
      valorFixo: true,
    });
  } catch (e) {
    console.error("pix-info POST:", e);
    return NextResponse.json(
      { configurado: true, erro: "Não foi possível gerar o QR Code Pix." },
      { status: 500 }
    );
  }
}
