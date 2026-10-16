// Datas de calendário são tratadas como string "AAAA-MM-DD" (sem fuso),
// o que evita o bug de mostrar o dia anterior ao converter UTC → local.
export const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
export const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const pad = (n: number) => String(n).padStart(2, "0");

/** month: 0-11 */
export function toDateStr(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

export function todayStr() {
  const d = new Date();
  return toDateStr(d.getFullYear(), d.getMonth(), d.getDate());
}

export function dateOnly(iso: string) {
  return iso.slice(0, 10);
}

export function formatBR(iso: string) {
  const [y, m, d] = dateOnly(iso).split("-");
  return `${d}/${m}/${y}`;
}

function toUtc(dateStr: string) {
  const [y, m, d] = dateOnly(dateStr).split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

/** a - b, em dias */
export function diffDays(a: string, b: string) {
  return Math.round((toUtc(a) - toUtc(b)) / 86_400_000);
}

export function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

/** Células do mês (null = espaço vazio antes/depois), múltiplo de 7. */
export function monthGrid(year: number, month: number): (string | null)[] {
  const first = new Date(year, month, 1).getDay();
  const cells: (string | null)[] = Array(first).fill(null);
  for (let d = 1; d <= daysInMonth(year, month); d++) cells.push(toDateStr(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function monthOf(dateStr: string) {
  return Number(dateStr.slice(5, 7)) - 1;
}

export function formatDayLong(dateStr: string) {
  const [y, m, d] = dateOnly(dateStr).split("-").map(Number);
  const dow = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"][
    new Date(y, m - 1, d).getDay()
  ];
  return `${dow}, ${d} de ${MESES[m - 1].toLowerCase()}`;
}
