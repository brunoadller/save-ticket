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
            className={`text-left bg-white border rounded-lg p-4 transition-colors ${
              selecionado ? "border-accent ring-1 ring-accent" : "border-ink-900/10 hover:border-ink-900/25"
            }`}
          >
            <p className="text-xs text-ink-700/60">{STATUS_META[s].label}</p>
            <p className={`text-2xl font-semibold mt-1 ${s === "EXPIRADO" && n > 0 ? "text-danger" : "text-ink-900"}`}>
              {n}
            </p>
          </button>
        );
      })}
    </div>
  );
}
