import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export function NovoUsuario() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [papel, setPapel] = useState<"MEMBRO" | "ADMIN">("MEMBRO");
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [enviando, setEnviando] = useState(false);

  if (user?.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-ink-700/70">
          Apenas administradores podem cadastrar novos colegas.{" "}
          <Link to="/" className="text-accent hover:underline">
            Voltar
          </Link>
        </p>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setSucesso(false);
    setEnviando(true);
    try {
      await api.post("/auth/users", { name: nome, email, password: senha, role: papel });
      setSucesso(true);
      setNome("");
      setEmail("");
      setSenha("");
    } catch (err: any) {
      setErro(err.response?.data?.error || "Não foi possível criar o usuário.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6">
          <Link to="/" className="text-xs text-accent hover:underline">
            ← Voltar ao painel
          </Link>
          <h1 className="text-xl font-semibold text-ink-900 mt-2">Adicionar colega de equipe</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 bg-white border border-ink-900/10 rounded-lg p-6">
          {erro && <p className="text-sm text-danger bg-danger/10 rounded px-3 py-2">{erro}</p>}
          {sucesso && (
            <p className="text-sm text-ok bg-ok/10 rounded px-3 py-2">
              Conta criada com sucesso. A pessoa já pode entrar com o e-mail e senha definidos.
            </p>
          )}

          <div>
            <label className="block text-sm font-medium text-ink-800 mb-1">Nome</label>
            <input
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full rounded border border-ink-900/15 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-800 mb-1">E-mail</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border border-ink-900/15 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-800 mb-1">Senha provisória</label>
            <input
              required
              type="password"
              minLength={8}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full rounded border border-ink-900/15 px-3 py-2 text-sm"
              placeholder="Mínimo 8 caracteres"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-800 mb-1">Permissão</label>
            <select
              value={papel}
              onChange={(e) => setPapel(e.target.value as "MEMBRO" | "ADMIN")}
              className="w-full rounded border border-ink-900/15 px-3 py-2 text-sm bg-white"
            >
              <option value="MEMBRO">Membro da equipe</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={enviando}
            className="w-full bg-ink-900 text-white rounded py-2 text-sm font-medium hover:bg-ink-800 disabled:opacity-60"
          >
            {enviando ? "Criando…" : "Criar conta"}
          </button>
        </form>
      </div>
    </div>
  );
}
