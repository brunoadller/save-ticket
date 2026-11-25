import { DeadlineTone } from "../../lib/ticketDeadline";

const base = { width: 13, height: 13, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2 };

/** Ícone do aviso de prazo: o estado nunca depende só da cor. */
export function ToneIcon({ tone }: { tone: DeadlineTone }) {
  if (tone === "ok")
    return (
      <svg {...base} aria-hidden>
        <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  if (tone === "danger")
    return (
      <svg {...base} aria-hidden>
        <path d="M12 4l9 16H3L12 4z" strokeLinejoin="round" />
        <path d="M12 10v4M12 17.2v.1" strokeLinecap="round" />
      </svg>
    );
  // warn e muted: relógio
  return (
    <svg {...base} aria-hidden>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
