import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ThemeToggle } from "../components/ui/ThemeToggle";

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
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <ThemeToggle className="absolute top-4 right-4" />
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <p className="text-xs font-medium tracking-wide text-muted">Polos Pelotas/RS</p>
          <h1 className="text-2xl font-semibold text-fg mt-1">Gestão de chamados</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-surface border border-line rounded-xl shadow-card p-6">
          {erro && (
            <p className="text-sm text-danger bg-danger/10 rounded px-3 py-2">{erro}</p>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-fg mb-1">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border border-line-strong px-3 py-2 text-sm focus:border-accent"
              placeholder="voce@exemplo.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-fg mb-1">
              Senha
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border border-line-strong px-3 py-2 text-sm focus:border-accent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-btn text-btn-fg rounded py-2 text-sm font-medium hover:bg-btn-hover transition-colors disabled:opacity-60"
          >
            {carregando ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
