import { useState } from "react";
import { Task, TaskFormData } from "../../types";
import { TaskForm } from "./TaskForm";

interface Props {
  tarefa: Task;
  onToggle: () => void;
  onEditar: (d: TaskFormData) => Promise<void>;
  onExcluir: () => void;
}

export function TaskItem({ tarefa, onToggle, onEditar, onExcluir }: Props) {
  const [editando, setEditando] = useState(false);

  if (editando) {
    return (
      <div className="border border-ink-900/10 rounded p-3 bg-white">
        <TaskForm
          dataInicial={tarefa.data}
          tarefa={tarefa}
          onCancel={() => setEditando(false)}
          onSubmit={async (d) => {
            await onEditar(d);
            setEditando(false);
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`flex gap-3 border rounded p-3 bg-white ${
        tarefa.atrasada ? "border-danger/40 bg-danger/5" : "border-ink-900/10"
      }`}
    >
      <button
        onClick={onToggle}
        aria-label={tarefa.concluida ? "Reabrir tarefa" : "Concluir tarefa"}
        className={`mt-0.5 w-5 h-5 shrink-0 rounded-full border flex items-center justify-center text-[11px] ${
          tarefa.concluida ? "bg-ok border-ok text-white" : "border-ink-900/30 hover:border-ok"
        }`}
      >
        {tarefa.concluida && "✓"}
      </button>

      <div className="min-w-0 flex-1">
        <p className={`text-sm font-medium ${tarefa.concluida ? "line-through text-ink-700/50" : "text-ink-900"}`}>
          {tarefa.titulo}
        </p>
        {tarefa.descricao && (
          <p className="text-xs text-ink-700/70 mt-0.5 whitespace-pre-wrap">{tarefa.descricao}</p>
        )}
        {tarefa.atrasada && <p className="text-xs text-danger font-medium mt-1">Prazo vencido — não concluída</p>}
        <div className="flex gap-3 mt-2 text-xs">
          <button onClick={() => setEditando(true)} className="text-accent hover:underline">
            Editar
          </button>
          <button onClick={onExcluir} className="text-danger hover:underline">
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}
