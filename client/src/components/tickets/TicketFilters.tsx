import { POLOS } from "../../constants";
import { TicketStatus } from "../../types";
import { inputClass } from "../ui/Field";

export interface Filtros {
  busca: string;
  polo: string;
  status: TicketStatus | "";
}

interface Props {
  value: Filtros;
  onChange: (f: Filtros) => void;
}

export function TicketFilters({ value, onChange }: Props) {
  const set = <K extends keyof Filtros>(k: K, v: Filtros[K]) => onChange({ ...value, [k]: v });
  return (
    <div className="flex flex-wrap gap-3">
      <input
        value={value.busca}
        onChange={(e) => set("busca", e.target.value)}
        placeholder="Buscar protocolo, aluno ou CPF"
        className={`${inputClass} !w-64`}
      />
      <select value={value.polo} onChange={(e) => set("polo", e.target.value)} className={`${inputClass} !w-auto`}>
        <option value="">Todos os polos</option>
        {POLOS.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>
      <select
        value={value.status}
        onChange={(e) => set("status", e.target.value as Filtros["status"])}
        className={`${inputClass} !w-auto`}
      >
        <option value="">Todos os status</option>
        <option value="ANDAMENTO">Em andamento</option>
        <option value="EXPIRADO">Prazo expirado</option>
        <option value="CONCLUIDO">Concluído</option>
      </select>
    </div>
  );
}
