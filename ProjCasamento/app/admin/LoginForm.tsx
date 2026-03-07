"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
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
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok) {
        router.refresh();
      } else {
        setErro(data.erro || "Senha incorreta.");
      }
    } catch {
      setErro("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-10">
      <h1 className="font-heading text-2xl font-bold text-stone-800 mb-6 text-center">
        Área Admin
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Senha
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-5 py-4 border border-stone-200 rounded-2xl bg-white focus:ring-2 focus:ring-casamento-oliva focus:border-transparent placeholder:text-stone-400 transition-all"
            placeholder="Digite a senha"
            autoFocus
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
