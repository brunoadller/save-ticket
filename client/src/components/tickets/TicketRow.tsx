import { useExpandable } from "../../hooks/useExpandable";
import { Ticket } from "../../types";
import { POLO_META, poloLabel, STATUS_META, studentStatusClass, studentStatusLabel } from "../../constants";
import { formatBR } from "../../lib/dates";
import { deadlineInfo, deadlineProgress, TONE_CLASS } from "../../lib/ticketDeadline";
import { Avatar } from "../ui/Avatar";
import { ToneIcon } from "../ui/ToneIcon";
import { TicketDetails } from "./TicketDetails";

interface Props {
  ticket: Ticket;
  podeExcluir: boolean;
  selecionado: boolean;
  onSelect: (checked: boolean) => void;
  onEdit: () => void;
  onToggleConcluido: () => void;
  onExcluir: () => void;
}

function PersonLine({ label, name, ring, note }: { label: string; name?: string; ring?: boolean; note?: string }) {
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <span className="w-9 shrink-0 text-[10px] uppercase tracking-wide text-muted">{label}</span>
      {name ? (
        <>
          <Avatar name={name} size="sm" ring={ring} />
          <span className="truncate text-xs text-fg" title={`${label === "Criou" ? "Criado por" : "Responsável"}: ${name}`}>
            {name}
          </span>
          {note && (
            <span className="shrink-0 text-xs font-bold text-accent" title="Responsável diferente de quem criou o chamado">
              <span aria-hidden>↪</span>
              <span className="sr-only">{note}</span>
            </span>
          )}
        </>
      ) : (
        <span className="text-xs italic text-muted">Sem responsável</span>
      )}
    </div>
  );
}

export function TicketRow({ ticket, podeExcluir, selecionado, onSelect, onEdit, onToggleConcluido, onExcluir }: Props) {
  const { ref, open: aberto, mounted, expanded, toggle } = useExpandable<HTMLDivElement>();
  const status = STATUS_META[ticket.status];
  const prazo = deadlineInfo(ticket);
  const concluido = ticket.status === "CONCLUIDO";
  const andamento = ticket.status === "ANDAMENTO";
  const polo = POLO_META[ticket.polo];
  const repassado = !!ticket.assignedTo && ticket.assignedTo.id !== ticket.createdBy?.id;
  const progresso = andamento ? deadlineProgress(ticket) : 0;
  const situacao = studentStatusLabel(ticket.situacaoAtual);
  const contato = [ticket.cpf, ticket.telefone].filter(Boolean).join(" · ");

  return (
    <div
      ref={ref}
      className={`scroll-mt-16 border-b border-line last:border-b-0 border-l-4 ${status.stripe} transition-[background-color,box-shadow] duration-300 ${
        selecionado ? "bg-accent/10" : "hover:bg-fg/[0.03]"
      } ${aberto ? "ring-1 ring-inset ring-accent/50" : ""}`}
    >
      <div className="flex items-stretch">
        {/* Seleção: fora da área clicável da linha, não abre o detalhe */}
        <div className="w-10 shrink-0 flex justify-center items-start md:items-center pt-5 md:pt-0" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={selecionado}
            disabled={!podeExcluir}
            onChange={(e) => onSelect(e.target.checked)}
            onClick={(e) => e.stopPropagation()}
            title={podeExcluir ? undefined : "Só o criador do chamado ou um administrador pode excluir."}
            aria-label={`Selecionar chamado ${ticket.protocolo}`}
            className="h-4 w-4 accent-[rgb(var(--accent-fill))] cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
          />
        </div>

        <div
          onClick={toggle}
          className="relative flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-x-3 gap-y-3 items-center pr-4 py-4 cursor-pointer"
          aria-expanded={aberto}
        >
          {/* Status primeiro no celular (selos no topo do cartão) */}
          <div className="md:col-span-2 md:order-last space-y-1.5">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} aria-hidden />
              {status.label}
            </span>
            <p className={`flex items-center gap-1 text-xs ${TONE_CLASS[prazo.tone]}`}>
              <ToneIcon tone={prazo.tone} />
              {prazo.text}
            </p>
            {andamento && (
              <div
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progresso * 100)}
                aria-label={`${Math.round(progresso * 100)}% do prazo já passou`}
                className="h-1 w-full max-w-[9rem] overflow-hidden rounded-full bg-line"
              >
                <div
                  className={`h-full rounded-full ${progresso >= 0.8 ? "bg-warn" : "bg-accent-fill"}`}
                  style={{ width: `${Math.round(progresso * 100)}%` }}
                />
              </div>
            )}
          </div>

          <div className="absolute right-0 top-4 md:static md:col-span-1 flex items-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleConcluido();
              }}
              title={concluido ? "Reabrir chamado" : "Marcar como concluído"}
              aria-label={concluido ? "Reabrir chamado" : "Marcar como concluído"}
              className={`h-6 w-6 rounded-full border flex items-center justify-center text-xs transition-colors ${
                concluido
                  ? "bg-ok border-ok text-on-solid"
                  : "border-line-strong text-transparent hover:border-ok hover:text-ok"
              }`}
            >
              ✓
            </button>
          </div>

          <div className="md:col-span-2 min-w-0 space-y-1.5">
            <span className="inline-block max-w-full truncate rounded-md border border-line bg-subtle px-2 py-0.5 font-mono text-[13px] text-fg">
              {ticket.protocolo}
            </span>
            <div>
              {polo && (
                <span title={poloLabel(ticket.polo)} className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${polo.className}`}>
                  {polo.short}
                </span>
              )}
            </div>
          </div>

          <div className="md:col-span-3 min-w-0 flex items-start gap-3">
            <Avatar name={ticket.nomeAluno} />
            <div className="min-w-0 space-y-0.5">
              <p className={`truncate text-sm font-semibold ${concluido ? "text-muted line-through" : "text-fg"}`}>
                {ticket.nomeAluno}
              </p>
              {contato && (
                <p className="truncate text-xs text-muted" title={contato}>
                  {contato}
                </p>
              )}
              {situacao && (
                <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${studentStatusClass(ticket.situacaoAtual)}`}>
                  {situacao}
                </span>
              )}
            </div>
          </div>

          <div className="md:col-span-2 min-w-0 space-y-1">
            <PersonLine label="Criou" name={ticket.createdBy?.name} />
            <PersonLine
              label="Resp."
              name={ticket.assignedTo?.name}
              ring={repassado}
              note={repassado ? "repassado" : undefined}
            />
          </div>

          <div className="md:col-span-2 text-xs">
            <p className="text-muted">Previsão</p>
            <p className="text-sm font-medium text-fg">{formatBR(ticket.dataPrazo)}</p>
            <p className="mt-0.5 text-muted">Realização {formatBR(ticket.dataCriacao)}</p>
          </div>
        </div>
      </div>

      {/* A altura anima de 0fr a 1fr, sem precisar medir o conteúdo */}
      {mounted && (
        <div
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out motion-reduce:transition-none ${
            expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="min-h-0 overflow-hidden">
            <TicketDetails ticket={ticket} podeExcluir={podeExcluir} onEdit={onEdit} onExcluir={onExcluir} />
          </div>
        </div>
      )}
    </div>
  );
}
