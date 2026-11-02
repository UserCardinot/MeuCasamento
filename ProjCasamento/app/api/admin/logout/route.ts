import { NextResponse } from "next/server";
import { COOKIE_SESSAO } from "@/lib/admin-sessao";

export async function POST() {
  const response = NextResponse.json({ sucesso: true });
  response.cookies.set(COOKIE_SESSAO, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
  });
  return response;
}
