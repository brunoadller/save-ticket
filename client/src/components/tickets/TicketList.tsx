import { useEffect, useRef } from "react";
import { Ticket } from "../../types";
import { SortDir, SortKey } from "../../lib/ticketFilters";
import { TicketRow } from "./TicketRow";

interface Props {
  tickets: Ticket[];
  carregando: boolean;
  vazioMensagem: string;
  vazioAcao?: { label: string; onClick: () => void };
  ordem: SortKey;
  dir: SortDir;
  onSort: (key: SortKey) => void;
  currentUser?: { id: string; role: string };
  selectedIds: Set<string>;
  selectableCount: number; // chamados do resultado filtrado que o usuário pode excluir
  onToggleSelect: (id: string, checked: boolean) => void;
  onToggleAll: (checked: boolean) => void;
  onEdit: (t: Ticket) => void;
  onToggleConcluido: (t: Ticket) => void;
  onExcluir: (t: Ticket) => void;
}

const SORT_LABEL: Record<SortKey, string> = { prazo: "Previsão", realizacao: "Realização", aluno: "Aluno" };

function SortButton({
  label,
  col,
  ordem,
  dir,
  onSort,
}: {
  label: string;
  col: SortKey;
  ordem: SortKey;
  dir: SortDir;
  onSort: (k: SortKey) => void;
}) {
  const ativo = ordem === col;
  return (
    <button
      type="button"
      onClick={() => onSort(col)}
      aria-sort={ativo ? (dir === "asc" ? "ascending" : "descending") : "none"}
      className={`inline-flex items-center gap-1 rounded font-semibold uppercase tracking-wide hover:text-fg ${
        ativo ? "text-fg" : ""
      }`}
    >
      {label}
      <span aria-hidden className={ativo ? "text-accent" : "opacity-50"}>
        {ativo ? (dir === "asc" ? "↑" : "↓") : "↕"}
      </span>
    </button>
  );
}

function Skeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Carregando chamados">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="flex animate-pulse items-center gap-4 border-b border-line border-l-4 border-l-transparent px-4 py-5 last:border-b-0">
          <div className="h-4 w-4 rounded bg-line" />
          <div className="h-6 w-6 rounded-full bg-line" />
          <div className="h-6 w-24 rounded-md bg-line" />
          <div className="flex flex-1 items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-line" />
            <div className="space-y-2">
              <div className="h-3 w-40 rounded bg-line" />
              <div className="h-3 w-28 rounded bg-line/70" />
            </div>
          </div>
          <div className="hidden h-3 w-28 rounded bg-line md:block" />
          <div className="hidden h-6 w-28 rounded-full bg-line md:block" />
        </div>
      ))}
      <span className="sr-only">Carregando chamados…</span>
    </div>
  );
}

function EmptyState({ mensagem, acao }: { mensagem: string; acao?: { label: string; onClick: () => void } }) {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-subtle text-muted">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
          <rect x="4" y="4" width="16" height="16" rx="3" />
          <path d="M8.5 12h7M8.5 8.5h7M8.5 15.5h4" strokeLinecap="round" />
        </svg>
      </span>
      <p className="max-w-sm text-sm text-muted">{mensagem}</p>
      {acao && (
        <button
          onClick={acao.onClick}
          className="rounded-md bg-btn px-4 py-2 text-sm font-medium text-btn-fg hover:bg-btn-hover"
        >
          {acao.label}
        </button>
      )}
    </div>
  );
}

export function TicketList({
  tickets,
  carregando,
  vazioMensagem,
  vazioAcao,
  ordem,
  dir,
  onSort,
  currentUser,
  selectedIds,
  selectableCount,
  onToggleSelect,
  onToggleAll,
  onEdit,
  onToggleConcluido,
  onExcluir,
}: Props) {
  const todos = selectableCount > 0 && selectedIds.size === selectableCount;
  const parcial = selectedIds.size > 0 && !todos;
  const headerBox = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (headerBox.current) headerBox.current.indeterminate = parcial; // estado intermediário
  }, [parcial]);

  return (
    <div className="rounded-xl border border-line bg-surface shadow-card">
      {/* Cabeçalho fixo ao rolar */}
      <div className="sticky top-0 z-10 flex items-center rounded-t-xl border-b border-line bg-subtle border-l-4 border-l-transparent text-[11px] text-muted">
        <div className="flex w-10 shrink-0 items-center justify-center py-2.5">
          <input
            ref={headerBox}
            type="checkbox"
            checked={todos}
            disabled={selectableCount === 0}
            onChange={(e) => onToggleAll(e.target.checked)}
            aria-label="Selecionar todos os chamados do resultado que você pode excluir"
            title="Selecionar todos os chamados do resultado que você pode excluir"
            className="h-4 w-4 accent-[rgb(var(--accent-fill))] cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
          />
        </div>

        {/* Celular: ordenação em um seletor (os cabeçalhos de coluna só existem no computador) */}
        <div className="flex flex-1 items-center justify-between gap-2 pr-3 md:hidden">
          <span>Selecionar todos</span>
          <span className="flex items-center gap-1.5">
            <label className="sr-only" htmlFor="ordem-mobile">
              Ordenar por
            </label>
            <select
              id="ordem-mobile"
              value={ordem}
              onChange={(e) => {
                const k = e.target.value as SortKey;
                if (k !== ordem) onSort(k);
              }}
              className="rounded-md border border-line-strong px-2 py-1 text-xs"
            >
              {(Object.keys(SORT_LABEL) as SortKey[]).map((k) => (
                <option key={k} value={k}>
                  {SORT_LABEL[k]}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => onSort(ordem)}
              aria-label={dir === "asc" ? "Ordem crescente. Inverter" : "Ordem decrescente. Inverter"}
              className="rounded-md border border-line-strong px-2 py-1 text-xs text-fg"
            >
              {dir === "asc" ? "↑" : "↓"}
            </button>
          </span>
        </div>

        <div className="hidden min-w-0 flex-1 grid-cols-12 items-center gap-x-3 pr-4 md:grid">
          <div className="col-span-1" />
          <div className="col-span-2 font-semibold uppercase tracking-wide">Protocolo</div>
          <div className="col-span-3">
            <SortButton label="Aluno" col="aluno" ordem={ordem} dir={dir} onSort={onSort} />
          </div>
          <div className="col-span-2 font-semibold uppercase tracking-wide">Pessoas</div>
          <div className="col-span-2 flex flex-col items-start gap-0.5">
            <SortButton label="Previsão" col="prazo" ordem={ordem} dir={dir} onSort={onSort} />
            <SortButton label="Realização" col="realizacao" ordem={ordem} dir={dir} onSort={onSort} />
          </div>
          <div className="col-span-2 font-semibold uppercase tracking-wide">Status</div>
        </div>
      </div>

      <div className="[&>*:last-child]:rounded-b-xl">
        {carregando ? (
          <Skeleton />
        ) : tickets.length === 0 ? (
          <EmptyState mensagem={vazioMensagem} acao={vazioAcao} />
        ) : (
          tickets.map((t) => (
            <TicketRow
              key={t.id}
              ticket={t}
              podeExcluir={!!currentUser && (currentUser.role === "ADMIN" || t.createdBy?.id === currentUser.id)}
              selecionado={selectedIds.has(t.id)}
              onSelect={(checked) => onToggleSelect(t.id, checked)}
              onEdit={() => onEdit(t)}
              onToggleConcluido={() => onToggleConcluido(t)}
              onExcluir={() => onExcluir(t)}
            />
          ))
        )}
      </div>
    </div>
  );
}
