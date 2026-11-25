import { avatarTone, initials } from "../../lib/avatar";

interface Props {
  name: string;
  size?: "sm" | "md";
  /** Realça o avatar (ex.: responsável diferente do criador). */
  ring?: boolean;
  className?: string;
}

/** Círculo com as iniciais do nome. Decorativo: o nome sempre aparece em texto ao lado. */
export function Avatar({ name, size = "md", ring = false, className = "" }: Props) {
  const dim = size === "sm" ? "h-5 w-5 text-[9px]" : "h-9 w-9 text-xs";
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold ${dim} ${avatarTone(name)} ${
        ring ? "ring-2 ring-accent/60" : ""
      } ${className}`}
    >
      {initials(name)}
    </span>
  );
}
