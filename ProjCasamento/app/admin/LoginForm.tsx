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
    <div className="w-full max-w-sm">
      <h1 className="font-heading text-2xl font-bold text-stone-800 mb-6 text-center">
        Área Admin
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Senha
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-casamento-verde focus:border-casamento-verde"
            placeholder="Digite a senha"
            autoFocus
          />
        </div>
        {erro && <p className="text-red-600 text-sm">{erro}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-casamento-verde text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
