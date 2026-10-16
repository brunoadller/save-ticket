import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err: any) {
      setErro(err.response?.data?.error || "Não foi possível entrar. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <p className="text-xs font-medium tracking-wide text-ink-700/60">Polos Pelotas/RS</p>
          <h1 className="text-2xl font-semibold text-ink-900 mt-1">Gestão de chamados</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-white border border-ink-900/10 rounded-lg p-6">
          {erro && (
            <p className="text-sm text-danger bg-danger/10 rounded px-3 py-2">{erro}</p>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-ink-800 mb-1">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border border-ink-900/15 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="voce@exemplo.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-ink-800 mb-1">
              Senha
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border border-ink-900/15 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-ink-900 text-white rounded py-2 text-sm font-medium hover:bg-ink-800 transition-colors disabled:opacity-60"
          >
            {carregando ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
