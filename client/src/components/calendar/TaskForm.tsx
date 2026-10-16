import { FormEvent, useState } from "react";
import { Task, TaskFormData } from "../../types";
import { Field, inputClass } from "../ui/Field";

interface Props {
  dataInicial: string;
  tarefa?: Task;
  onSubmit: (d: TaskFormData) => Promise<void>;
  onCancel?: () => void;
}

export function TaskForm({ dataInicial, tarefa, onSubmit, onCancel }: Props) {
  const [titulo, setTitulo] = useState(tarefa?.titulo ?? "");
  const [descricao, setDescricao] = useState(tarefa?.descricao ?? "");
  const [data, setData] = useState(tarefa?.data ?? dataInicial);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      await onSubmit({ titulo, descricao, data });
      if (!tarefa) {
        setTitulo("");
        setDescricao("");
      }
    } catch (err: any) {
      setErro(err.response?.data?.error || "Não foi possível salvar a tarefa.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {erro && <p className="text-xs text-danger bg-danger/10 rounded px-2 py-1.5">{erro}</p>}
      <Field label="Tarefa">
        <input
          required
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className={inputClass}
          placeholder="Ex.: cobrar o polo sobre o protocolo…"
        />
      </Field>
      <Field label="O que deve ser feito">
        <textarea rows={3} value={descricao} onChange={(e) => setDescricao(e.target.value)} className={inputClass} />
      </Field>
      <Field label="Dia">
        <input required type="date" value={data} onChange={(e) => setData(e.target.value)} className={inputClass} />
      </Field>
      <div className="flex justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-sm rounded border border-ink-900/15 text-ink-800 hover:bg-slate-50"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={enviando}
          className="px-3 py-1.5 text-sm rounded bg-ink-900 text-white hover:bg-ink-800 disabled:opacity-60"
        >
          {enviando ? "Salvando…" : tarefa ? "Salvar" : "Adicionar tarefa"}
        </button>
      </div>
    </form>
  );
}
