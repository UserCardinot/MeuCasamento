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
    const [convidados, presencas, presentes, uploads, recados, catalogoPresentes] = await Promise.all([
      readFromSheet(sheetId, "Convidados!A2:F"),
      readFromSheet(sheetId, "Presenças!A2:F"),
      readFromSheet(sheetId, "Presentes!A2:D"),
      readFromSheet(sheetId, "Uploads!A2:D"),
      readFromSheet(sheetId, "Recados!A2:D").catch(() => []),
      readFromSheet(sheetId, "CatalogoPresentes!A2:E").catch(() => []),
    ]);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const convidadosFormatados = (convidados as (string | number)[][]).map((row) => ({
      token: String(row[0] ?? ""),
      nome: String(row[1] ?? ""),
      acompanhantes: String(row[2] ?? ""),
      contato: String(row[3] ?? ""),
      data: String(row[4] ?? ""),
      origem: String(row[5] ?? ""),
      link: `${baseUrl}/convite?token=${row[0]}`,
    }));

    const tokenParaNome = new Map(convidadosFormatados.map((c) => [c.token.toLowerCase(), c.nome]));

    const presencasFormatadas = (presencas as (string | number)[][]).map((row) => ({
      token: row[0],
      nome: tokenParaNome.get(String(row[0] ?? "").toLowerCase()) ?? "-",
      confirmado: row[1],
      telefone: row[2],
      mensagem: row[3],
      nomesAcompanhantes: row[4],
      data: row[5] ?? row[3],
    }));

    const presentesFormatados = (presentes as (string | number)[][]).map((row) => ({
      token: row[0],
      nome: tokenParaNome.get(String(row[0] ?? "").toLowerCase()) ?? "-",
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

    const recadosFormatados = (recados as (string | number)[][]).map((row) => ({
      token: row[0],
      nome: row[1],
      mensagem: row[2],
      data: row[3],
    }));

    const catalogoFormatado = (catalogoPresentes as (string | number)[][]).map((row) => ({
      nome: String(row[0] ?? ""),
      preco: String(row[1] ?? ""),
      url: String(row[2] ?? ""),
      imagem: String(row[3] ?? ""),
      ativo: String(row[4] ?? "Sim"),
    }));

    return NextResponse.json({
      convidados: convidadosFormatados,
      presencas: presencasFormatadas,
      presentes: presentesFormatados,
      uploads: uploadsFormatados,
      recados: recadosFormatados,
      catalogoPresentes: catalogoFormatado,
      resumo: {
        totalConvidados: convidadosFormatados.length,
        totalPresencas: presencasFormatadas.length,
        totalPresentes: presentesFormatados.length,
        totalUploads: uploadsFormatados.length,
        totalRecados: recadosFormatados.length,
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
