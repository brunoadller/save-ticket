import { STATUS_META } from "../../constants";
import { Ticket, TicketStatus } from "../../types";

interface Props {
  tickets: Ticket[];
  ativo: TicketStatus | "";
  onSelect: (s: TicketStatus | "") => void;
}

const ORDEM: TicketStatus[] = ["ANDAMENTO", "EXPIRADO", "CONCLUIDO"];

/** Cards de contagem; clicar filtra a lista pelo status. */
export function TicketStats({ tickets, ativo, onSelect }: Props) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {ORDEM.map((s) => {
        const n = tickets.filter((t) => t.status === s).length;
        const selecionado = ativo === s;
        return (
          <button
            key={s}
            onClick={() => onSelect(selecionado ? "" : s)}
            aria-pressed={selecionado}
            className={`text-left bg-surface border rounded-xl p-4 shadow-card transition-colors ${
              selecionado ? "border-accent ring-1 ring-accent" : "border-line hover:border-line-strong"
            }`}
          >
            <p className="flex items-center gap-2 text-xs text-muted">
              <span className={`h-2 w-2 rounded-full ${STATUS_META[s].dot}`} aria-hidden />
              {STATUS_META[s].label}
            </p>
            <p className={`text-2xl font-semibold mt-1 ${s === "EXPIRADO" && n > 0 ? "text-danger" : "text-fg"}`}>
              {n}
            </p>
          </button>
        );
      })}
    </div>
  );
}
