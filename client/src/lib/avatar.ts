/** Iniciais para avatares: primeira letra do primeiro e do último nome. */
export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

// Fundo translúcido + letra na cor cheia: funciona nos dois temas (cores vêm das variáveis CSS)
const TONES = [
  "bg-info/15 text-info",
  "bg-violet/15 text-violet",
  "bg-teal/15 text-teal",
  "bg-pink/15 text-pink",
  "bg-warn/15 text-warn",
  "bg-accent/15 text-accent",
];

/** Cor estável derivada do nome (a mesma pessoa sempre tem a mesma cor). */
export function avatarTone(name: string) {
  let h = 0;
  for (const ch of name.toLowerCase()) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return TONES[h % TONES.length];
}
