import { Ticket } from "../../types";
import { formatBR } from "../../lib/dates";

interface Props {
  ticket: Ticket;
  onEdit: () => void;
  onExcluir: () => void;
}

function Item({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-xs text-ink-700/50">{label}</p>
      <p className="text-sm text-ink-900">{value || "—"}</p>
    </div>
  );
}

/** Visualização completa do chamado (aparece ao expandir a linha). */
export function TicketDetails({ ticket, onEdit, onExcluir }: Props) {
  return (
    <div className="px-4 pb-4 pt-1 bg-slate-50/70">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Item label="RA" value={ticket.ra} />
        <Item label="Curso" value={ticket.curso} />
        <Item label="Situação atual" value={ticket.situacaoAtual} />
        <Item label="Cadastrado por" value={ticket.createdBy?.name} />
      </div>

      <div className="mt-4">
        <p className="text-xs text-ink-700/50">Justificativa</p>
        <p className="text-sm text-ink-900 whitespace-pre-wrap">{ticket.justificativa || "—"}</p>
      </div>

      {ticket.dataConclusao && (
        <p className="mt-3 text-xs text-ok">Concluído em {formatBR(ticket.dataConclusao)}</p>
      )}

      <div className="mt-4 flex gap-2 text-xs">
        <button
          onClick={onEdit}
          className="px-3 py-1.5 rounded border border-ink-900/15 text-ink-800 hover:bg-white"
        >
          Editar
        </button>
        <button
          onClick={onExcluir}
          className="px-3 py-1.5 rounded border border-danger/30 text-danger hover:bg-danger/10"
        >
          Excluir
        </button>
      </div>
    </div>
  );
}
