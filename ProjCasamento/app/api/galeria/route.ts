import { NextRequest, NextResponse } from "next/server";
import { readFromSheet } from "@/lib/google";
import { validateEventToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const eventToken =
    request.nextUrl.searchParams.get("eventToken") ||
    request.nextUrl.searchParams.get("eventtoken") ||
    (() => {
      for (const [k, v] of request.nextUrl.searchParams.entries()) {
        if (k.toLowerCase() === "eventtoken" && v.trim()) return v.trim();
      }
      return null;
    })();
  if (!eventToken || !validateEventToken(eventToken)) {
    return NextResponse.json({ erro: "Token inválido" }, { status: 401 });
  }

  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) {
    return NextResponse.json({ erro: "Configuração do servidor" }, { status: 500 });
  }

  try {
    const rows = await readFromSheet(sheetId, "Uploads!A2:E");
    const fotos = (rows as (string | number)[][])
      .filter((row) => {
        const t = String(row[0] ?? "").toLowerCase();
        return t === "foto" || t === "video";
      })
      .map((row) => ({
        nome: String(row[1] ?? "Anônimo"),
        arquivo: String(row[2] ?? ""),
        data: String(row[3] ?? ""),
        momento: String(row[4] ?? ""),
        tipo: String(row[0] ?? "foto").toLowerCase(),
      }));
    return NextResponse.json({ fotos });
  } catch (err) {
    console.error("Erro ao listar galeria:", err);
    return NextResponse.json({ erro: "Erro ao carregar fotos" }, { status: 500 });
  }
}
