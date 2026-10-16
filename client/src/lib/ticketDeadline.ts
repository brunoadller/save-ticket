import { Ticket } from "../types";
import { dateOnly, diffDays, formatBR, todayStr } from "./dates";

export type DeadlineTone = "ok" | "warn" | "danger" | "muted";

/** Texto e cor do aviso de prazo, em relação à data de previsão. */
export function deadlineInfo(t: Ticket): { text: string; tone: DeadlineTone } {
  if (t.status === "CONCLUIDO") {
    const quando = t.dataConclusao ? ` em ${formatBR(t.dataConclusao)}` : "";
    const atrasado = t.dataConclusao && dateOnly(t.dataConclusao) > dateOnly(t.dataPrazo);
    return atrasado
      ? { text: `Concluído com atraso${quando}`, tone: "warn" }
      : { text: `Concluído${quando}`, tone: "ok" };
  }
  const dias = diffDays(t.dataPrazo, todayStr());
  if (dias < 0) {
    const n = Math.abs(dias);
    return { text: `Atrasado há ${n} dia${n > 1 ? "s" : ""}`, tone: "danger" };
  }
  if (dias === 0) return { text: "Vence hoje", tone: "warn" };
  if (dias === 1) return { text: "Vence amanhã", tone: "warn" };
  return { text: `Faltam ${dias} dias`, tone: "muted" };
}

export const TONE_CLASS: Record<DeadlineTone, string> = {
  ok: "text-ok",
  warn: "text-warn",
  danger: "text-danger font-medium",
  muted: "text-ink-700/60",
};
