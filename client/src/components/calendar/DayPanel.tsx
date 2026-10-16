import { Task, TaskFormData, Ticket } from "../../types";
import { formatDayLong } from "../../lib/dates";
import { poloLabel, STATUS_META } from "../../constants";
import { TaskForm } from "./TaskForm";
import { TaskItem } from "./TaskItem";

interface Props {
  dia: string;
  tarefas: Task[];
  chamados: Ticket[]; // chamados com previsão neste dia
  onCriar: (d: TaskFormData) => Promise<void>;
  onEditar: (id: string, d: TaskFormData) => Promise<void>;
  onAlternar: (t: Task) => void;
  onExcluir: (t: Task) => void;
  onFechar: () => void;
}

export function DayPanel({ dia, tarefas, chamados, onCriar, onEditar, onAlternar, onExcluir, onFechar }: Props) {
  return (
    <div className="bg-white border border-ink-900/10 rounded-lg p-4 space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-ink-700/50">Dia selecionado</p>
          <h3 className="text-base font-semibold text-ink-900 capitalize">{formatDayLong(dia)}</h3>
        </div>
        <button onClick={onFechar} className="text-xs text-ink-700/60 hover:text-ink-900">
          Fechar
        </button>
      </div>

      <section className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">Tarefas</h4>
        {tarefas.length === 0 ? (
          <p className="text-sm text-ink-700/60">Nenhuma tarefa neste dia.</p>
        ) : (
          tarefas.map((t) => (
            <TaskItem
              key={t.id}
              tarefa={t}
              onToggle={() => onAlternar(t)}
              onEditar={(d) => onEditar(t.id, d)}
              onExcluir={() => confirm(`Excluir a tarefa “${t.titulo}”?`) && onExcluir(t)}
            />
          ))
        )}
      </section>

      {chamados.length > 0 && (
        <section className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">Chamados com previsão neste dia</h4>
          {chamados.map((c) => (
            <div key={c.id} className="border border-ink-900/10 rounded p-2.5 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-ink-900">{c.protocolo}</span>
                <span className={`text-[11px] font-medium rounded px-1.5 py-0.5 ${STATUS_META[c.status].className}`}>
                  {STATUS_META[c.status].label}
                </span>
              </div>
              <p className="text-xs text-ink-700/70">
                {c.nomeAluno} · {poloLabel(c.polo)}
              </p>
            </div>
          ))}
        </section>
      )}

      <section className="border-t border-ink-900/10 pt-4">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-700/60 mb-3">Nova tarefa</h4>
        <TaskForm key={dia} dataInicial={dia} onSubmit={onCriar} />
      </section>
    </div>
  );
}
