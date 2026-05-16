import { NextRequest, NextResponse } from "next/server";
import { validateGuestToken } from "@/lib/auth";
import { getPresencaStatus } from "@/lib/google";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")?.trim();
  if (!token) {
    return NextResponse.json({ erro: "Token obrigatório" }, { status: 400 });
  }

  const isValid = await validateGuestToken(token);
  if (!isValid) {
    return NextResponse.json({ erro: "Token inválido" }, { status: 401 });
  }

  const presenca = await getPresencaStatus(token);
  return NextResponse.json({
    respondeu: presenca !== null,
    confirmado: presenca?.confirmado === true,
  });
}
