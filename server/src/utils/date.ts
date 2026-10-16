// Datas "de calendário" (sem horário) são comparadas como string YYYY-MM-DD,
// usando o fuso de Pelotas/RS — evita o bug de o prazo vencer 21h do dia anterior (UTC).
const TZ = "America/Sao_Paulo";

export function todayStr(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());
}

export function dayStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function isPastDay(d: Date): boolean {
  return dayStr(d) < todayStr();
}
