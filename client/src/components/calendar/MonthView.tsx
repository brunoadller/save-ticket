import { Task, Ticket } from "../../types";
import { DIAS_SEMANA, monthGrid, todayStr } from "../../lib/dates";

interface Props {
  ano: number;
  mes: number;
  tarefasPorDia: Record<string, Task[]>;
  chamadosPorDia: Record<string, Ticket[]>;
  selecionado: string | null;
  onSelecionarDia: (d: string) => void;
}

/** Grade do mês: cada dia mostra suas tarefas e chamados com previsão. */
export function MonthView({ ano, mes, tarefasPorDia, chamadosPorDia, selecionado, onSelecionarDia }: Props) {
  const hoje = todayStr();
  const celulas = monthGrid(ano, mes);

  return (
    <div className="bg-surface border border-line rounded-lg overflow-hidden">
      <div className="grid grid-cols-7 border-b border-line bg-subtle">
        {DIAS_SEMANA.map((d) => (
          <div key={d} className="px-2 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {celulas.map((dia, i) => {
          if (!dia) return <div key={i} className="min-h-[5.5rem] bg-subtle/50 border-b border-r border-line" />;

          const tarefas = tarefasPorDia[dia] ?? [];
          const chamados = chamadosPorDia[dia] ?? [];
          const atrasadas = tarefas.filter((t) => t.atrasada).length;
          const pendentes = tarefas.filter((t) => !t.concluida && !t.atrasada).length;
          const feitas = tarefas.filter((t) => t.concluida).length;
          const chamadosAbertos = chamados.filter((c) => c.status !== "CONCLUIDO");
          const ehHoje = dia === hoje;
          const ehSel = dia === selecionado;

          return (
            <button
              key={dia}
              onClick={() => onSelecionarDia(dia)}
              className={`min-h-[5.5rem] p-2 text-left align-top border-b border-r border-line transition-colors hover:bg-subtle ${
                ehSel ? "bg-accent/10 ring-1 ring-inset ring-accent" : ""
              }`}
            >
              <span
                className={`inline-flex items-center justify-center text-xs w-6 h-6 rounded-full ${
                  ehHoje ? "bg-btn text-btn-fg font-semibold" : "text-fg"
                }`}
              >
                {Number(dia.slice(8))}
              </span>

              <div className="mt-1 space-y-0.5 text-[11px]">
                {atrasadas > 0 && (
                  <p className="rounded px-1 py-0.5 bg-danger/15 text-danger font-medium truncate">
                    {atrasadas} atrasada{atrasadas > 1 ? "s" : ""}
                  </p>
                )}
                {pendentes > 0 && (
                  <p className="rounded px-1 py-0.5 bg-accent/15 text-accent truncate">
                    {pendentes} tarefa{pendentes > 1 ? "s" : ""}
                  </p>
                )}
                {feitas > 0 && (
                  <p className="rounded px-1 py-0.5 bg-ok/15 text-ok truncate">
                    {feitas} feita{feitas > 1 ? "s" : ""}
                  </p>
                )}
                {chamadosAbertos.length > 0 && (
                  <p
                    className={`rounded px-1 py-0.5 truncate border ${
                      chamadosAbertos.some((c) => c.status === "EXPIRADO")
                        ? "border-danger/40 text-danger"
                        : "border-warn/40 text-warn"
                    }`}
                  >
                    {chamadosAbertos.length} chamado{chamadosAbertos.length > 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
