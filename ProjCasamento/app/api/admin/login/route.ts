import { NextRequest, NextResponse } from "next/server";
import { validateAdminPassword, createAdminSessionToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ erro: "Dados inválidos" }, { status: 400 });
  }

  const password = body?.password;
  if (!password || typeof password !== "string") {
    return NextResponse.json({ erro: "Senha obrigatória" }, { status: 400 });
  }

  if (!validateAdminPassword(password)) {
    return NextResponse.json({ erro: "Senha incorreta" }, { status: 401 });
  }

  const token = createAdminSessionToken();
  const response = NextResponse.json({ sucesso: true });
  response.cookies.set("admin_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 horas
    path: "/",
  });
  return response;
}
