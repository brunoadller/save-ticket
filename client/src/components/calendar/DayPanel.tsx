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
    <div className="bg-surface border border-line rounded-lg p-4 space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted">Dia selecionado</p>
          <h3 className="text-base font-semibold text-fg capitalize">{formatDayLong(dia)}</h3>
        </div>
        <button onClick={onFechar} className="text-xs text-muted hover:text-fg">
          Fechar
        </button>
      </div>

      <section className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted">Tarefas</h4>
        {tarefas.length === 0 ? (
          <p className="text-sm text-muted">Nenhuma tarefa neste dia.</p>
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
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted">Chamados com previsão neste dia</h4>
          {chamados.map((c) => (
            <div key={c.id} className="border border-line rounded p-2.5 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-fg">{c.protocolo}</span>
                <span className={`text-[11px] font-medium rounded px-1.5 py-0.5 ${STATUS_META[c.status].className}`}>
                  {STATUS_META[c.status].label}
                </span>
              </div>
              <p className="text-xs text-muted">
                {c.nomeAluno} · {poloLabel(c.polo)}
              </p>
            </div>
          ))}
        </section>
      )}

      <section className="border-t border-line pt-4">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted mb-3">Nova tarefa</h4>
        <TaskForm key={dia} dataInicial={dia} onSubmit={onCriar} />
      </section>
    </div>
  );
}
