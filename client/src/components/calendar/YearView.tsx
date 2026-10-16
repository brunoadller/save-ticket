import { MonthCard, ResumoMes } from "./MonthCard";

interface Props {
  ano: number;
  mesAtual: number | null; // índice do mês atual, se o ano exibido for o atual
  resumos: ResumoMes[];
  onSelecionarMes: (m: number) => void;
}

export function YearView({ mesAtual, resumos, onSelecionarMes }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      {resumos.map((r, m) => (
        <MonthCard key={m} mes={m} resumo={r} atual={mesAtual === m} onClick={() => onSelecionarMes(m)} />
      ))}
    </div>
  );
}
