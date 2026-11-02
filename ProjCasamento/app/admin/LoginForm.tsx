"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm({ titulo }: { titulo: string }) {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, senha }),
      });
      const data = await res.json();
      if (res.ok) {
        router.refresh();
      } else {
        setErro(data.erro || "Usuário ou senha incorretos.");
      }
    } catch {
      setErro("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full px-5 py-4 border border-stone-200 rounded-2xl bg-white focus:ring-2 focus:ring-casamento-oliva focus:border-transparent placeholder:text-stone-400 transition-all";

  return (
    <div className="w-full max-w-sm rounded-2xl border border-stone-200/80 bg-white p-10 shadow-sm">
      <h1 className="mb-1 text-center font-heading text-2xl font-semibold text-stone-900">Área Admin</h1>
      <p className="mb-6 text-center text-sm text-stone-500">{titulo}</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="login-usuario" className="mb-1.5 block text-sm font-medium text-stone-700">
            Usuário
          </label>
          <input
            id="login-usuario"
            type="text"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            className={inputClass}
            placeholder="Seu usuário"
            autoComplete="username"
            autoCapitalize="none"
            autoFocus
            required
          />
        </div>
        <div>
          <label htmlFor="login-senha" className="mb-1.5 block text-sm font-medium text-stone-700">
            Senha
          </label>
          <input
            id="login-senha"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className={inputClass}
            placeholder="Sua senha"
            autoComplete="current-password"
            required
          />
        </div>
        {erro && <p className="text-red-600 text-sm">{erro}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-casamento-oliva-escuro text-white font-sans font-medium rounded-2xl hover:bg-casamento-oliva/90 active:scale-[0.98] disabled:opacity-50 transition shadow-sm focus:ring-2 focus:ring-casamento-oliva focus:ring-offset-2 focus:outline-none"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
