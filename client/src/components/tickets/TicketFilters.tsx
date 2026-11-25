import { useMemo, useState } from "react";
import { POLOS, poloLabel, STATUS_META } from "../../constants";
import { Person, Ticket } from "../../types";
import {
  countActiveFilters,
  personOptions,
  periodShortcut,
  SEM_RESPONSAVEL,
  TicketFilters as Filters,
} from "../../lib/ticketFilters";
import { todayStr } from "../../lib/dates";
import { inputClass } from "../ui/Field";
import { PersonSelect } from "./PersonSelect";

interface Props {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
  onClear: () => void;
  tickets: Ticket[]; // todos os chamados (para as contagens dos seletores)
  users: Person[];
  currentUserId?: string;
  shown: number;
  total: number;
}

const chip =
  "inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2.5 py-1 text-xs text-fg";
const shortcutBtn = "px-3 py-1.5 text-xs rounded border transition-colors";

export function TicketFilters({ filters, onChange, onClear, tickets, users, currentUserId, shown, total }: Props) {
  const criadores = useMemo(() => personOptions(users, tickets, (t) => t.createdBy), [users, tickets]);
  const responsaveis = useMemo(() => personOptions(users, tickets, (t) => t.assignedTo), [users, tickets]);
  const ativos = countActiveFilters(filters);
  const [abertoMobile, setAbertoMobile] = useState(false); // filtros secundários recolhidos no celular
  const hoje = todayStr();
  const nomeDe = (id: string) =>
    [...criadores.list, ...responsaveis.list].find((p) => p.id === id)?.name ?? "Usuário removido";

  const hojeAtivo = filters.de === hoje && filters.ate === hoje && !filters.atrasados;
  const semana = periodShortcut("semana", hoje);
  const semanaAtiva = filters.de === semana.de && filters.ate === semana.ate && !filters.atrasados;
  const meus = !!currentUserId && filters.responsavel === currentUserId;
  const criadosPorMim = !!currentUserId && filters.criador === currentUserId;

  const toggle = (on: boolean) =>
    on ? `${shortcutBtn} border-accent bg-accent/15 text-accent` : `${shortcutBtn} border-line text-fg hover:bg-surface`;

  const chips: { key: string; label: string; clear: Partial<Filters> }[] = [];
  if (filters.criador) chips.push({ key: "criador", label: `Criado por: ${nomeDe(filters.criador)}`, clear: { criador: "" } });
  if (filters.responsavel)
    chips.push({
      key: "responsavel",
      label: `Responsável: ${filters.responsavel === SEM_RESPONSAVEL ? "Sem responsável" : nomeDe(filters.responsavel)}`,
      clear: { responsavel: "" },
    });
  if (filters.polo) chips.push({ key: "polo", label: poloLabel(filters.polo), clear: { polo: "" } });
  if (filters.status) chips.push({ key: "status", label: STATUS_META[filters.status].label, clear: { status: "" } });
  if (filters.atrasados) chips.push({ key: "atrasados", label: "Atrasados", clear: { atrasados: false } });
  if (filters.de || filters.ate)
    chips.push({
      key: "periodo",
      label: `Previsão: ${filters.de ? filters.de.split("-").reverse().join("/") : "…"} – ${
        filters.ate ? filters.ate.split("-").reverse().join("/") : "…"
      }`,
      clear: { de: "", ate: "" },
    });
  if (filters.q.trim()) chips.push({ key: "q", label: `Busca: “${filters.q.trim()}”`, clear: { q: "" } });

  return (
    <div className="space-y-3 rounded-xl border border-line bg-surface p-4 shadow-card">
      <div className="flex items-center gap-2">
        <label className="relative flex-1">
          <span className="sr-only">Buscar chamados</span>
          <svg
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden
          >
            <circle cx="11" cy="11" r="6.5" />
            <path d="M16 16l4 4" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={filters.q}
            onChange={(e) => onChange({ q: e.target.value })}
            placeholder="Buscar por protocolo, aluno, CPF, telefone ou RA"
            aria-label="Buscar chamados"
            className={`${inputClass} !pl-9`}
          />
        </label>
        <button
          type="button"
          onClick={() => setAbertoMobile((v) => !v)}
          aria-expanded={abertoMobile}
          aria-controls="filtros-secundarios"
          className="rounded-md border border-line-strong px-3 py-2 text-sm text-fg md:hidden"
        >
          Filtros{ativos > 0 ? ` (${ativos})` : ""}
        </button>
      </div>

      <div id="filtros-secundarios" className={`space-y-3 ${abertoMobile ? "block" : "hidden"} md:block`}>
      <div className="flex flex-wrap items-end gap-3">
        <PersonSelect
          label="Criado por"
          value={filters.criador}
          onChange={(criador) => onChange({ criador })}
          options={criadores.list}
          total={tickets.length}
        />
        <PersonSelect
          label="Responsável"
          value={filters.responsavel}
          onChange={(responsavel) => onChange({ responsavel })}
          options={responsaveis.list}
          semPessoa={responsaveis.semPessoa}
          total={tickets.length}
        />
        <label className="flex flex-col gap-1 text-xs text-muted">
          Polo
          <select
            value={filters.polo}
            onChange={(e) => onChange({ polo: e.target.value })}
            aria-label="Polo"
            className={`${inputClass} !w-auto`}
          >
            <option value="">Todos os polos</option>
            {POLOS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-muted">
          Status
          <select
            value={filters.status}
            onChange={(e) => onChange({ status: e.target.value as Filters["status"] })}
            aria-label="Status"
            className={`${inputClass} !w-auto`}
          >
            <option value="">Todos os status</option>
            <option value="ANDAMENTO">Em andamento</option>
            <option value="EXPIRADO">Prazo expirado</option>
            <option value="CONCLUIDO">Concluído</option>
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Atalhos">
          <button
            type="button"
            disabled={!currentUserId}
            aria-pressed={meus}
            className={toggle(meus)}
            onClick={() => onChange({ responsavel: meus ? "" : currentUserId! })}
          >
            Meus chamados
          </button>
          <button
            type="button"
            disabled={!currentUserId}
            aria-pressed={criadosPorMim}
            className={toggle(criadosPorMim)}
            onClick={() => onChange({ criador: criadosPorMim ? "" : currentUserId! })}
          >
            Criados por mim
          </button>
          <span className="w-px h-5 bg-line" aria-hidden />
          <button
            type="button"
            aria-pressed={hojeAtivo}
            className={toggle(hojeAtivo)}
            onClick={() => onChange(hojeAtivo ? { de: "", ate: "" } : { ...periodShortcut("hoje", hoje), atrasados: false })}
          >
            Hoje
          </button>
          <button
            type="button"
            aria-pressed={semanaAtiva}
            className={toggle(semanaAtiva)}
            onClick={() => onChange(semanaAtiva ? { de: "", ate: "" } : { ...semana, atrasados: false })}
          >
            Esta semana
          </button>
          <button
            type="button"
            aria-pressed={filters.atrasados}
            className={toggle(filters.atrasados)}
            onClick={() => onChange(filters.atrasados ? { atrasados: false } : { atrasados: true, de: "", ate: "" })}
          >
            Atrasados
          </button>
        </div>

        <div className="flex items-end gap-2">
          <label className="flex flex-col gap-1 text-xs text-muted">
            Previsão de
            <input
              type="date"
              value={filters.de}
              max={filters.ate || undefined}
              onChange={(e) => onChange({ de: e.target.value, atrasados: false })}
              className={`${inputClass} !w-auto`}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted">
            até
            <input
              type="date"
              value={filters.ate}
              min={filters.de || undefined}
              onChange={(e) => onChange({ ate: e.target.value, atrasados: false })}
              className={`${inputClass} !w-auto`}
            />
          </label>
        </div>
      </div>

      </div>

      <div className="flex flex-wrap items-center gap-2 min-h-[1.75rem]">
        <p className="text-xs text-muted" aria-live="polite">
          {shown} de {total} chamados
          {ativos > 0 && ` · ${ativos} filtro${ativos > 1 ? "s" : ""} ativo${ativos > 1 ? "s" : ""}`}
        </p>
        {chips.map((c) => (
          <span key={c.key} className={chip}>
            {c.label}
            <button
              type="button"
              onClick={() => onChange(c.clear)}
              aria-label={`Remover filtro: ${c.label}`}
              className="text-muted hover:text-danger"
            >
              ×
            </button>
          </span>
        ))}
        {ativos > 0 && (
          <button type="button" onClick={onClear} className="text-xs text-accent hover:underline">
            Limpar filtros
          </button>
        )}
      </div>
    </div>
  );
}
