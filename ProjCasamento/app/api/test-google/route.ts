/**
 * Rota de teste para verificar conexão com Google Sheets
 * Acesse: http://localhost:3000/api/test-google
 * (Remova esta rota antes do deploy em produção)
 */

import { NextResponse } from "next/server";
import { readFromSheet } from "@/lib/google";

export async function GET() {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) {
    return NextResponse.json(
      { erro: "GOOGLE_SHEET_ID não configurado" },
      { status: 500 }
    );
  }

  try {
    const data = await readFromSheet(sheetId, "Convidados!A1:E2");
    return NextResponse.json({
      sucesso: true,
      mensagem: "Google Sheets conectado!",
      dados: data,
    });
  } catch (err) {
    const mensagem = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json(
      { erro: mensagem, sucesso: false },
      { status: 500 }
    );
  }
}
