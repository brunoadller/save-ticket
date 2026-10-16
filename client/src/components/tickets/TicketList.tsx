import { Ticket } from "../../types";
import { TicketRow } from "./TicketRow";

interface Props {
  tickets: Ticket[];
  carregando: boolean;
  vazioMensagem: string;
  onEdit: (t: Ticket) => void;
  onToggleConcluido: (t: Ticket) => void;
  onExcluir: (t: Ticket) => void;
}

export function TicketList({ tickets, carregando, vazioMensagem, onEdit, onToggleConcluido, onExcluir }: Props) {
  return (
    <div className="bg-white border border-ink-900/10 rounded-lg overflow-hidden">
      <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-2 border-b border-ink-900/10 bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-ink-700/50">
        <div className="col-span-1" />
        <div className="col-span-2">Protocolo</div>
        <div className="col-span-3">Aluno / CPF</div>
        <div className="col-span-2">Realização</div>
        <div className="col-span-2">Previsão</div>
        <div className="col-span-2 text-right">Status</div>
      </div>

      {carregando ? (
        <p className="px-4 py-8 text-center text-sm text-ink-700/60">Carregando chamados…</p>
      ) : tickets.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-ink-700/60">{vazioMensagem}</p>
      ) : (
        tickets.map((t) => (
          <TicketRow
            key={t.id}
            ticket={t}
            onEdit={() => onEdit(t)}
            onToggleConcluido={() => onToggleConcluido(t)}
            onExcluir={() => onExcluir(t)}
          />
        ))
      )}
    </div>
  );
}
