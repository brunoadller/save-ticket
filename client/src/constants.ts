export const POLOS = [
  { value: "PELOTAS_I", label: "Pelotas/RS – I (4306)" },
  { value: "PELOTAS_II", label: "Pelotas/RS – II (14630166)" },
  { value: "PELOTAS_III", label: "Pelotas/RS – III (15121831)" },
] as const;

export function poloLabel(value: string) {
  return POLOS.find((p) => p.value === value)?.label ?? value;
}

export const STATUS_META: Record<
  string,
  { label: string; className: string; dot: string; stripe: string }
> = {
  ANDAMENTO: {
    label: "Em andamento",
    className: "bg-accent/15 text-accent",
    dot: "bg-accent-fill",
    stripe: "border-l-accent-fill",
  },
  CONCLUIDO: { label: "Concluído", className: "bg-ok/15 text-ok", dot: "bg-ok", stripe: "border-l-ok" },
  EXPIRADO: { label: "Prazo expirado", className: "bg-danger/15 text-danger", dot: "bg-danger", stripe: "border-l-danger" },
};

/** Nome curto e cor própria de cada polo (selo pequeno). */
export const POLO_META: Record<string, { short: string; className: string }> = {
  PELOTAS_I: { short: "Pelotas I", className: "bg-teal/15 text-teal" },
  PELOTAS_II: { short: "Pelotas II", className: "bg-pink/15 text-pink" },
  PELOTAS_III: { short: "Pelotas III", className: "bg-info/15 text-info" },
};

export const STUDENT_STATUS = [
  { value: "ATIVO", label: "Ativo", className: "bg-info/15 text-info" },
  { value: "FORMANDO", label: "Formando", className: "bg-violet/15 text-violet" },
  { value: "CONCLUIDO", label: "Concluído", className: "bg-ok/15 text-ok" },
  { value: "DESISTENTE", label: "Desistente", className: "bg-muted/15 text-muted" },
  { value: "SEM_MATRICULA", label: "Não efetuou a matrícula", className: "bg-warn/15 text-warn" },
] as const;

export function studentStatusClass(value: string | null | undefined) {
  return STUDENT_STATUS.find((s) => s.value === value)?.className ?? "";
}

export function studentStatusLabel(value: string | null | undefined) {
  return STUDENT_STATUS.find((s) => s.value === value)?.label ?? "";
}
