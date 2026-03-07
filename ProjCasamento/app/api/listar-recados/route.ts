import { NextRequest, NextResponse } from "next/server";
import { readFromSheet } from "@/lib/google";
import { validateGuestToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token || !(await validateGuestToken(token))) {
    return NextResponse.json({ erro: "Token inválido" }, { status: 401 });
  }

  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) {
    return NextResponse.json({ erro: "Configuração do servidor" }, { status: 500 });
  }

  try {
    const rows = await readFromSheet(sheetId, "Recados!A2:D");
    const recados = (rows as (string | number)[][]).map((row) => ({
      nome: String(row[1] ?? "Anônimo"),
      mensagem: String(row[2] ?? ""),
      data: String(row[3] ?? ""),
    }));
    return NextResponse.json({ recados });
  } catch (err) {
    console.error("Erro ao listar recados:", err);
    return NextResponse.json({ erro: "Erro ao carregar recados" }, { status: 500 });
  }
}
