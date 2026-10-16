import { useState } from "react";
import { Ticket } from "../../types";
import { poloLabel, STATUS_META } from "../../constants";
import { formatBR } from "../../lib/dates";
import { deadlineInfo, TONE_CLASS } from "../../lib/ticketDeadline";
import { TicketDetails } from "./TicketDetails";

interface Props {
  ticket: Ticket;
  onEdit: () => void;
  onToggleConcluido: () => void;
  onExcluir: () => void;
}

export function TicketRow({ ticket, onEdit, onToggleConcluido, onExcluir }: Props) {
  const [aberto, setAberto] = useState(false);
  const status = STATUS_META[ticket.status];
  const prazo = deadlineInfo(ticket);
  const concluido = ticket.status === "CONCLUIDO";
  const expirado = ticket.status === "EXPIRADO";

  return (
    <div className={`border-b border-ink-900/10 last:border-b-0 ${expirado ? "bg-danger/5" : ""}`}>
      <div
        onClick={() => setAberto((v) => !v)}
        className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors"
      >
        <div className="md:col-span-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleConcluido();
            }}
            title={concluido ? "Reabrir chamado" : "Marcar como concluído"}
            aria-label={concluido ? "Reabrir chamado" : "Marcar como concluído"}
            className={`w-5 h-5 rounded-full border flex items-center justify-center text-[11px] ${
              concluido ? "bg-ok border-ok text-white" : "border-ink-900/30 hover:border-ok"
            }`}
          >
            {concluido && "✓"}
          </button>
        </div>

        <div className="md:col-span-2">
          <p className="text-sm font-mono text-ink-900">{ticket.protocolo}</p>
          <p className="text-xs text-ink-700/60">{poloLabel(ticket.polo)}</p>
        </div>

        <div className="md:col-span-3 min-w-0">
          <p className={`text-sm font-medium truncate ${concluido ? "text-ink-700/60 line-through" : "text-ink-900"}`}>
            {ticket.nomeAluno}
          </p>
          <p className="text-xs text-ink-700/60 font-mono">{ticket.cpf}</p>
        </div>

        <div className="md:col-span-2 text-xs text-ink-700/70">
          <p className="text-ink-700/50">Realização</p>
          <p className="text-sm text-ink-900">{formatBR(ticket.dataCriacao)}</p>
        </div>

        <div className="md:col-span-2 text-xs">
          <p className="text-ink-700/50">Previsão</p>
          <p className="text-sm text-ink-900">{formatBR(ticket.dataPrazo)}</p>
          <p className={TONE_CLASS[prazo.tone]}>{prazo.text}</p>
        </div>

        <div className="md:col-span-2 flex md:flex-col md:items-end gap-2">
          <span className={`inline-block text-xs font-medium rounded px-2 py-1 ${status.className}`}>
            {status.label}
          </span>
        </div>
      </div>

      {aberto && (
        <TicketDetails
          ticket={ticket}
          onEdit={onEdit}
          onExcluir={onExcluir}
        />
      )}
    </div>
  );
}
