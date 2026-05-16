import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { validateGuestToken } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getCatalogoPresentes } from "@/lib/google";
import {
  buildExternalReference,
  canUseMercadoPagoAutoReturn,
  formatMercadoPagoApiError,
  getCheckoutBaseUrl,
  resolveCheckoutAmount,
  resolveMercadoPagoInitPoint,
  shouldUseMercadoPagoSandbox,
} from "@/lib/mercadopago-shared";

export const dynamic = "force-dynamic";

function itemIdFromTitle(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return slug || "presente";
}

export async function POST(request: NextRequest) {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim();
  if (!accessToken) {
    return NextResponse.json(
      { erro: "Pagamento com cartão não configurado (MERCADOPAGO_ACCESS_TOKEN)." },
      { status: 503 }
    );
  }

  const ip = getClientIp(request);
  const { allowed } = checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { erro: "Muitas tentativas. Aguarde um minuto." },
      { status: 429 }
    );
  }

  let body: { token?: string; presente?: string; valor?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ erro: "Dados inválidos" }, { status: 400 });
  }

  const { token, presente } = body;
  const { valor } = body;

  if (!token || typeof token !== "string") {
    return NextResponse.json({ erro: "Token obrigatório" }, { status: 400 });
  }
  if (!presente || typeof presente !== "string" || !presente.trim()) {
    return NextResponse.json({ erro: "Presente obrigatório" }, { status: 400 });
  }

  const isValid = await validateGuestToken(token);
  if (!isValid) {
    return NextResponse.json({ erro: "Token inválido" }, { status: 401 });
  }

  const catalog = await getCatalogoPresentes();
  const item = catalog.find((p) => p.nome.trim() === presente.trim());
  if (!item) {
    return NextResponse.json({ erro: "Presente não encontrado na lista." }, { status: 400 });
  }

  const amountRes = resolveCheckoutAmount({
    catalogPreco: item.preco,
    valorDigitado: typeof valor === "string" ? valor : undefined,
  });
  if ("error" in amountRes) {
    return NextResponse.json({ erro: amountRes.error }, { status: 400 });
  }
  const { amount } = amountRes;

  let externalReference: string;
  try {
    externalReference = buildExternalReference(token, presente.trim());
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Referência inválida";
    return NextResponse.json({ erro: msg }, { status: 400 });
  }

  const base = getCheckoutBaseUrl(request);
  const tokenQ = encodeURIComponent(token.trim());
  const useAutoReturn = canUseMercadoPagoAutoReturn(base);
  const backUrls = {
    success: `${base}/presentes?token=${tokenQ}&mp=success`,
    pending: `${base}/presentes?token=${tokenQ}&mp=pending`,
    failure: `${base}/presentes?token=${tokenQ}&mp=failure`,
  };

  const client = new MercadoPagoConfig({ accessToken });
  const preference = new Preference(client);

  try {
    const result = await preference.create({
      body: {
        items: [
          {
            id: itemIdFromTitle(presente.trim()),
            title: `Presente: ${presente.trim().slice(0, 200)}`,
            quantity: 1,
            currency_id: "BRL",
            unit_price: amount,
          },
        ],
        external_reference: externalReference,
        statement_descriptor: "CASAMENTO",
        back_urls: backUrls,
        ...(useAutoReturn ? { auto_return: "approved" as const } : {}),
        ...(useAutoReturn ? { notification_url: `${base}/api/webhooks/mercadopago` } : {}),
      },
    });

    const sandbox = shouldUseMercadoPagoSandbox(accessToken);
    const initPoint = resolveMercadoPagoInitPoint(result, sandbox);

    if (!initPoint) {
      console.error("Mercado Pago: preferência sem init_point", result.id);
      return NextResponse.json(
        { erro: "Não foi possível abrir o checkout. Tente novamente." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      init_point: initPoint,
      preference_id: result.id,
      sandbox,
    });
  } catch (err) {
    const detalhe = formatMercadoPagoApiError(err);
    console.error("Mercado Pago preferência:", detalhe, err);
    const msg =
      process.env.NODE_ENV === "development"
        ? detalhe
        : "Erro ao criar pagamento. Tente novamente.";
    return NextResponse.json({ erro: msg }, { status: 502 });
  }
}
