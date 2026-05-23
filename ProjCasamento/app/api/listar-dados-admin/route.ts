import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { parsePresencaSheetRow, readFromSheet } from "@/lib/google";
import { validateAdminSessionToken } from "@/lib/auth";
import { getPublicSiteBaseUrl } from "@/lib/mercadopago-shared";

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
      readFromSheet(sheetId, "Presenças!A2:E"),
      readFromSheet(sheetId, "Presentes!A2:D"),
      readFromSheet(sheetId, "Uploads!A2:D"),
      readFromSheet(sheetId, "Recados!A2:D").catch(() => []),
      readFromSheet(sheetId, "CatalogoPresentes!A2:E").catch(() => []),
    ]);

    const baseUrl = getPublicSiteBaseUrl();

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

    const presencasFormatadas = (presencas as (string | number)[][]).map((row) => {
      const mapped = parsePresencaSheetRow(row);
      return {
        token: row[0],
        nome: tokenParaNome.get(String(row[0] ?? "").toLowerCase()) ?? "-",
        confirmado: row[1],
        nomesAcompanhantes: mapped.nomesAcompanhantes,
        data: mapped.data,
      };
    });

    const recadosPlanilha = (recados as (string | number)[][]).map((row) => ({
      token: String(row[0] ?? ""),
      nome: String(row[1] ?? ""),
      mensagem: String(row[2] ?? ""),
      data: String(row[3] ?? ""),
    }));

    const recadosPresenca = (presencas as (string | number)[][])
      .map((row) => {
        const mapped = parsePresencaSheetRow(row);
        if (!mapped.mensagem) return null;
        const token = String(row[0] ?? "");
        return {
          token,
          nome: tokenParaNome.get(token.toLowerCase()) ?? "-",
          mensagem: mapped.mensagem,
          data: mapped.data,
        };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);

    const recadosFormatados = [...recadosPlanilha, ...recadosPresenca];

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

    const catalogoFormatado = (catalogoPresentes as (string | number)[][]).map((row) => {
      const nome = String(row[0] ?? "");
      return {
        nomeOriginal: nome,
        nome,
        preco: String(row[1] ?? ""),
        url: String(row[2] ?? ""),
        imagem: String(row[3] ?? ""),
        ativo: String(row[4] ?? "Sim"),
      };
    });

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
