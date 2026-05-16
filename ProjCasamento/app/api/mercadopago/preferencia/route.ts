import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { validateGuestToken } from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getCatalogoPresentes } from "@/lib/google";
import {
  buildMercadoPagoLineItems,
  parsePresentesBody,
  resolvePresentesCatalogItems,
} from "@/lib/presentes-checkout";
import {
  buildExternalReference,
  canUseMercadoPagoAutoReturn,
  formatMercadoPagoApiError,
  getCheckoutBaseUrl,
  isMercadoPagoSandboxCheckoutUrl,
  mercadoPagoCollectorIdFromAccessToken,
  mercadoPagoCollectorIdFromPreferenceId,
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

  let body: { token?: string; presente?: string; presentes?: string[]; valor?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ erro: "Dados inválidos" }, { status: 400 });
  }

  const { token } = body;
  const nomes = parsePresentesBody(body);

  if (!token || typeof token !== "string") {
    return NextResponse.json({ erro: "Token obrigatório" }, { status: 400 });
  }
  if (nomes.length === 0) {
    return NextResponse.json({ erro: "Selecione ao menos um presente." }, { status: 400 });
  }

  const isValid = await validateGuestToken(token);
  if (!isValid) {
    return NextResponse.json({ erro: "Token inválido" }, { status: 401 });
  }

  const catalog = await getCatalogoPresentes();
  const resolved = resolvePresentesCatalogItems(catalog, nomes);
  if ("error" in resolved) {
    return NextResponse.json({ erro: resolved.error }, { status: 400 });
  }

  const lineItems = buildMercadoPagoLineItems(resolved.items, itemIdFromTitle);
  if ("error" in lineItems) {
    return NextResponse.json({ erro: lineItems.error }, { status: 400 });
  }

  let externalReference: string;
  try {
    externalReference = buildExternalReference(token, nomes);
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

  const sandbox = shouldUseMercadoPagoSandbox(accessToken);
  const testBuyerEmail = process.env.MERCADOPAGO_TEST_BUYER_EMAIL?.trim();

  const client = new MercadoPagoConfig({ accessToken });
  const preference = new Preference(client);

  try {
    const result = await preference.create({
      body: {
        items: lineItems.items,
        external_reference: externalReference,
        statement_descriptor: "CASAMENTO",
        back_urls: backUrls,
        ...(sandbox
          ? {
              payer: {
                ...(testBuyerEmail ? { email: testBuyerEmail } : {}),
                identification: { type: "CPF", number: "12345678909" },
              },
            }
          : {}),
        ...(useAutoReturn ? { auto_return: "approved" as const } : {}),
        ...(useAutoReturn ? { notification_url: `${base}/api/webhooks/mercadopago` } : {}),
      },
    });
    const initPoint = resolveMercadoPagoInitPoint(result, sandbox);

    if (!initPoint) {
      console.error("Mercado Pago: preferência sem init_point", result.id, { sandbox });
      const erroSandbox =
        sandbox
          ? "Checkout de teste indisponível. Confira MERCADOPAGO_ACCESS_TOKEN (credencial de teste) e MERCADOPAGO_SANDBOX=true."
          : "Não foi possível abrir o checkout. Tente novamente.";
      return NextResponse.json({ erro: erroSandbox }, { status: 502 });
    }

    if (sandbox && !isMercadoPagoSandboxCheckoutUrl(initPoint)) {
      console.error("Mercado Pago: SANDBOX ativo mas URL de produção", initPoint);
      return NextResponse.json(
        {
          erro:
            "Configuração de teste incorreta (URL de produção). Use Access Token de teste e MERCADOPAGO_SANDBOX=true.",
        },
        { status: 502 }
      );
    }

    const collectorId =
      mercadoPagoCollectorIdFromPreferenceId(result.id) ??
      mercadoPagoCollectorIdFromAccessToken(accessToken);
    const esperadoProducao = process.env.MERCADOPAGO_PRODUCAO_COLLECTOR_ID?.trim();

    if (!sandbox && esperadoProducao && collectorId && collectorId !== esperadoProducao) {
      return NextResponse.json(
        {
          erro: `Este site está com Access Token de TESTE (vendedor ${collectorId}). No Vercel Production use o token de PRODUÇÃO (vendedor ${esperadoProducao}) e MERCADOPAGO_SANDBOX=false. Pagamento com conta real só funciona com vendedor de produção.`,
        },
        { status: 400 }
      );
    }

    const total = lineItems.items.reduce((s, it) => s + it.unit_price, 0);
    const checkoutHost = new URL(initPoint).hostname;

    return NextResponse.json({
      init_point: initPoint,
      preference_id: result.id,
      sandbox,
      checkout_host: checkoutHost,
      collector_id: collectorId,
      total,
      quantidade: nomes.length,
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
