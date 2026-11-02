import { NextResponse } from "next/server";
import { exigirAdmin } from "@/lib/admin-sessao";
import { baseUrlDoEvento, toEventoPublico } from "@/lib/evento-atual";
import { formatarDataHoraRegistro } from "@/lib/evento";
import { listarConvidados } from "@/lib/repo/convidados";
import { listarPresencas } from "@/lib/repo/presencas";
import { listarPresentesRecebidos } from "@/lib/repo/presentes-recebidos";
import { listarRecados } from "@/lib/repo/recados";
import { listarCatalogo } from "@/lib/repo/catalogo";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await exigirAdmin();
  if (admin instanceof NextResponse) return admin;
  const { evento, usuario } = admin;

  try {
    const [convidados, presencas, presentes, recados, catalogo] = await Promise.all([
      listarConvidados(evento.id),
      listarPresencas(evento.id),
      listarPresentesRecebidos(evento.id),
      listarRecados(evento.id),
      listarCatalogo(evento.id),
    ]);

    const baseUrl = baseUrlDoEvento(evento);

    const convidadosFormatados = convidados.map((c) => ({
      token: c.token,
      nome: c.nome,
      acompanhantes: c.acompanhantes,
      contato: c.contato,
      data: formatarDataHoraRegistro(c.criadoEm),
      origem: c.origem,
      link: `${baseUrl}/convite?token=${c.token}`,
    }));

    const presencasFormatadas = presencas.map((p) => ({
      token: p.token,
      nome: p.nome,
      confirmado: p.confirmado ? "Sim" : "Não",
      nomesAcompanhantes: p.nomesAcompanhantes,
      data: formatarDataHoraRegistro(p.atualizadoEm),
    }));

    const recadosFormatados = [
      ...recados.map((r) => ({
        token: r.convidadoToken,
        nome: r.nome,
        mensagem: r.mensagem,
        data: formatarDataHoraRegistro(r.criadoEm),
        ts: r.criadoEm.getTime(),
      })),
      ...presencas
        .filter((p) => p.mensagem.trim())
        .map((p) => ({
          token: p.token,
          nome: p.nome,
          mensagem: p.mensagem,
          data: formatarDataHoraRegistro(p.atualizadoEm),
          ts: p.atualizadoEm.getTime(),
        })),
    ]
      .sort((a, b) => b.ts - a.ts)
      .map(({ ts: _ts, ...r }) => r);

    const presentesFormatados = presentes.map((p) => ({
      token: p.convidadoToken,
      nome: p.convidadoNome || "-",
      presente: p.presente,
      valor: p.valor,
      metodo: p.metodo,
      data: formatarDataHoraRegistro(p.criadoEm),
    }));

    const catalogoFormatado = catalogo.map((p) => ({
      nomeOriginal: p.nome,
      nome: p.nome,
      preco: p.preco,
      url: p.url,
      imagem: p.imagem,
      ativo: p.ativo ? "Sim" : "Não",
    }));

    return NextResponse.json({
      evento: { ...toEventoPublico(evento), baseUrl },
      usuario: {
        login: usuario.login,
        nome: usuario.nome,
        papel: usuario.papel,
        trocarSenha: usuario.trocarSenha,
      },
      convidados: convidadosFormatados,
      presencas: presencasFormatadas,
      presentes: presentesFormatados,
      recados: recadosFormatados,
      catalogoPresentes: catalogoFormatado,
      resumo: {
        totalConvidados: convidadosFormatados.length,
        totalPresencas: presencasFormatadas.length,
        totalPresentes: presentesFormatados.length,
        totalRecados: recadosFormatados.length,
      },
    });
  } catch (err) {
    console.error("Erro ao listar dados admin:", err);
    return NextResponse.json({ erro: "Erro ao carregar dados" }, { status: 500 });
  }
}
