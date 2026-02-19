import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readFromSheet } from "@/lib/google";
import { validateAdminSessionToken } from "@/lib/auth";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  if (!token || !validateAdminSessionToken(token)) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) {
    return NextResponse.json({ erro: "Configuração do servidor" }, { status: 500 });
  }

  try {
    const [convidados, presencas, presentes, uploads] = await Promise.all([
      readFromSheet(sheetId, "Convidados!A2:E"),
      readFromSheet(sheetId, "Presenças!A2:D"),
      readFromSheet(sheetId, "Presentes!A2:D"),
      readFromSheet(sheetId, "Uploads!A2:D"),
    ]);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const convidadosFormatados = (convidados as (string | number)[][]).map((row) => ({
      token: row[0],
      nome: row[1],
      acompanhantes: row[2],
      contato: row[3],
      data: row[4],
      link: `${baseUrl}/convite?token=${row[0]}`,
    }));

    const presencasFormatadas = (presencas as (string | number)[][]).map((row) => ({
      token: row[0],
      confirmado: row[1],
      telefone: row[2],
      data: row[3],
    }));

    const presentesFormatados = (presentes as (string | number)[][]).map((row) => ({
      token: row[0],
      presente: row[1],
      valor: row[2],
      data: row[3],
    }));

    const uploadsFormatados = (uploads as (string | number)[][]).map((row) => ({
      tipo: row[0],
      nome: row[1],
      arquivo: row[2],
      data: row[3],
    }));

    return NextResponse.json({
      convidados: convidadosFormatados,
      presencas: presencasFormatadas,
      presentes: presentesFormatados,
      uploads: uploadsFormatados,
      resumo: {
        totalConvidados: convidadosFormatados.length,
        totalPresencas: presencasFormatadas.length,
        totalPresentes: presentesFormatados.length,
        totalUploads: uploadsFormatados.length,
      },
    });
  } catch (err) {
    console.error("Erro ao listar dados admin:", err);
    return NextResponse.json(
      { erro: "Erro ao carregar dados" },
      { status: 500 }
    );
  }
}
