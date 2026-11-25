import { PersonOption, SEM_RESPONSAVEL } from "../../lib/ticketFilters";
import { inputClass } from "../ui/Field";

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: PersonOption[];
  /** Mostra a opção "Sem responsável" com a contagem informada. */
  semPessoa?: number;
  total: number;
}

/** Seletor de pessoa com contagem de chamados — usado em Chamados e no Calendário. */
export function PersonSelect({ label, value, onChange, options, semPessoa, total }: Props) {
  return (
    <label className="flex flex-col gap-1 text-xs text-muted">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className={`${inputClass} !w-auto min-w-[10rem]`}
      >
        <option value="">Todos ({total})</option>
        {semPessoa !== undefined && <option value={SEM_RESPONSAVEL}>Sem responsável ({semPessoa})</option>}
        {options.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} ({p.count})
          </option>
        ))}
      </select>
    </label>
  );
}
