export const POLOS = [
  { value: "PELOTAS_I", label: "Pelotas/RS – I (4306)" },
  { value: "PELOTAS_II", label: "Pelotas/RS – II (14630166)" },
  { value: "PELOTAS_III", label: "Pelotas/RS – III (15121831)" },
] as const;

export function poloLabel(value: string) {
  return POLOS.find((p) => p.value === value)?.label ?? value;
}

export const STATUS_META: Record<string, { label: string; className: string }> = {
  ANDAMENTO: { label: "Em andamento", className: "bg-accent-light/30 text-accent" },
  CONCLUIDO: { label: "Concluído", className: "bg-ok/15 text-ok" },
  EXPIRADO: { label: "Prazo expirado", className: "bg-danger/15 text-danger" },
};
