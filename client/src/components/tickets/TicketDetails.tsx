import { ReactNode } from "react";
import { Ticket } from "../../types";
import { formatBR } from "../../lib/dates";
import { poloLabel, studentStatusClass, studentStatusLabel } from "../../constants";
import { Avatar } from "../ui/Avatar";
import { CopyButton } from "../ui/CopyButton";

interface Props {
  ticket: Ticket;
  podeExcluir: boolean;
  onEdit: () => void;
  onExcluir: () => void;
}

function Section({ title, children, className = "" }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-lg border border-line bg-subtle p-4 ${className}`}>
      <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-muted">{title}</h4>
      {children}
    </section>
  );
}

interface ItemProps {
  label: string;
  value?: string;
  children?: ReactNode;
  copyId?: string; // quando informado (e houver valor), mostra o ícone de copiar
  className?: string;
}

function Item({ label, value, children, copyId, className = "" }: ItemProps) {
  return (
    <div className={`min-w-0 ${className}`}>
      <p className="text-xs text-muted">{label}</p>
      <div className="flex items-start gap-1">
        <div className="min-w-0 text-sm text-fg break-words">{children ?? (value || "—")}</div>
        {copyId && value && <CopyButton id={copyId} value={value} label={label} />}
      </div>
    </div>
  );
}

function Person({ name }: { name?: string }) {
  if (!name) return <span className="italic text-muted">Sem responsável</span>;
  return (
    <span className="inline-flex items-center gap-2">
      <Avatar name={name} size="sm" />
      {name}
    </span>
  );
}

/** Linha do tempo curta: realização → previsão → conclusão. */
function Timeline({ ticket }: { ticket: Ticket }) {
  const concluido = ticket.status === "CONCLUIDO";
  const expirado = ticket.status === "EXPIRADO";
  const steps = [
    { label: "Realização", date: formatBR(ticket.dataCriacao), reached: true, dot: "bg-accent-fill" },
    {
      label: "Previsão",
      date: formatBR(ticket.dataPrazo),
      reached: concluido || expirado,
      dot: expirado ? "bg-danger" : "bg-accent-fill",
    },
    {
      label: "Conclusão",
      date: ticket.dataConclusao ? formatBR(ticket.dataConclusao) : "Pendente",
      reached: concluido,
      dot: "bg-ok",
    },
  ];
  return (
    <ol className="flex items-start" aria-label="Linha do tempo do chamado">
      {steps.map((s, i) => (
        <li key={s.label} className="relative flex-1 min-w-0">
          {i > 0 && <span className="absolute left-[-50%] right-1/2 top-[5px] h-px bg-line-strong" aria-hidden />}
          <div className="relative flex flex-col items-center text-center">
            <span
              className={`h-[11px] w-[11px] rounded-full border-2 ${
                s.reached ? `${s.dot} border-transparent` : "border-line-strong bg-surface"
              }`}
              aria-hidden
            />
            <p className="mt-1.5 text-xs text-muted">{s.label}</p>
            <p className={`text-sm ${s.reached ? "font-medium text-fg" : "text-muted"}`}>{s.date}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Visualização completa do chamado (aparece ao expandir a linha). */
export function TicketDetails({ ticket, podeExcluir, onEdit, onExcluir }: Props) {
  const situacao = studentStatusLabel(ticket.situacaoAtual);
  const repassado = !!ticket.assignedTo && ticket.assignedTo.id !== ticket.createdBy?.id;

  return (
    <div className="border-t border-line bg-page/40 px-4 py-4 pl-14 space-y-3">
      <div className="grid gap-3 md:grid-cols-3">
        <Section title="Aluno">
          <div className="grid grid-cols-2 gap-3">
            <Item label="Nome" value={ticket.nomeAluno} copyId={`${ticket.id}:nome`} className="col-span-2" />
            <Item label="CPF" value={ticket.cpf} copyId={`${ticket.id}:cpf`} />
            <Item label="Telefone" value={ticket.telefone} copyId={`${ticket.id}:telefone`} />
            <Item label="RA" value={ticket.ra} copyId={`${ticket.id}:ra`} />
            <Item label="Curso" value={ticket.curso} copyId={`${ticket.id}:curso`} />
            <Item label="Situação atual" >
              {situacao ? (
                <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${studentStatusClass(ticket.situacaoAtual)}`}>
                  {situacao}
                </span>
              ) : ticket.situacaoAtualLegado ? (
                <span className="text-muted">{ticket.situacaoAtualLegado} (texto antigo)</span>
              ) : (
                "—"
              )}
            </Item>
          </div>
        </Section>

        <Section title="Chamado">
          <div className="space-y-3">
            <Item label="Protocolo" value={ticket.protocolo} copyId={`${ticket.id}:protocolo`}>
              <span className="font-mono">{ticket.protocolo}</span>
            </Item>
            <Item label="Polo" value={poloLabel(ticket.polo)} />
          </div>
        </Section>

        <Section title="Pessoas">
          <div className="space-y-3">
            <Item label="Criado por">
              <Person name={ticket.createdBy?.name} />
            </Item>
            <Item label="Responsável">
              <Person name={ticket.assignedTo?.name} />
              {repassado && <p className="mt-1 text-xs text-accent">Responsável diferente de quem criou o chamado.</p>}
            </Item>
          </div>
        </Section>
      </div>

      <Section title="Justificativa">
        <div className="flex items-start gap-2">
          <p className="min-w-0 text-sm text-fg whitespace-pre-wrap break-words">{ticket.justificativa || "—"}</p>
          {ticket.justificativa && (
            <CopyButton id={`${ticket.id}:justificativa`} value={ticket.justificativa} label="Justificativa" />
          )}
        </div>
      </Section>

      <Section title="Linha do tempo">
        <Timeline ticket={ticket} />
      </Section>

      <div className="flex gap-2 text-sm">
        <button onClick={onEdit} className="rounded-md border border-line-strong px-3 py-1.5 text-fg hover:bg-subtle">
          Editar
        </button>
        <button
          onClick={onExcluir}
          disabled={!podeExcluir}
          title={podeExcluir ? undefined : "Só o criador do chamado ou um administrador pode excluir."}
          className="rounded-md border border-danger/40 px-3 py-1.5 text-danger hover:bg-danger/10 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
        >
          Excluir
        </button>
      </div>
    </div>
  );
}
