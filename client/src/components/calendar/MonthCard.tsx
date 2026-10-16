import { MESES } from "../../lib/dates";

export interface ResumoMes {
  total: number;
  concluidas: number;
  atrasadas: number;
  chamados: number; // chamados com previsão no mês ainda em aberto
}

interface Props {
  mes: number;
  resumo: ResumoMes;
  atual: boolean;
  onClick: () => void;
}

/** Bloco de um mês na visão anual. */
export function MonthCard({ mes, resumo, atual, onClick }: Props) {
  const pct = resumo.total ? Math.round((resumo.concluidas / resumo.total) * 100) : 0;
  return (
    <button
      onClick={onClick}
      className={`text-left bg-white border rounded-lg p-4 hover:border-accent transition-colors ${
        resumo.atrasadas > 0 ? "border-danger/40" : atual ? "border-accent" : "border-ink-900/10"
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-ink-900">{MESES[mes]}</h3>
        {atual && <span className="text-[10px] font-semibold uppercase text-accent">Mês atual</span>}
      </div>

      <p className="text-sm text-ink-700/70 mt-3">
        {resumo.total === 0
          ? "Sem tarefas"
          : `${resumo.total} tarefa${resumo.total > 1 ? "s" : ""} · ${resumo.concluidas} concluída${
              resumo.concluidas === 1 ? "" : "s"
            }`}
      </p>

      <div className="h-1.5 rounded bg-slate-50 border border-ink-900/5 mt-2 overflow-hidden">
        <div className="h-full bg-ok" style={{ width: `${pct}%` }} />
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs min-h-[1.25rem]">
        {resumo.atrasadas > 0 && (
          <span className="rounded px-1.5 py-0.5 bg-danger/15 text-danger font-medium">
            {resumo.atrasadas} atrasada{resumo.atrasadas > 1 ? "s" : ""}
          </span>
        )}
        {resumo.chamados > 0 && (
          <span className="rounded px-1.5 py-0.5 bg-accent-light/30 text-accent">
            {resumo.chamados} chamado{resumo.chamados > 1 ? "s" : ""} vencendo
          </span>
        )}
      </div>
    </button>
  );
}
