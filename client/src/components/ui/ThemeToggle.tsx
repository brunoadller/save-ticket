import { Theme, useTheme } from "../../context/ThemeContext";

const icon = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8 };

const OPTIONS: { value: Theme; label: string; icon: JSX.Element }[] = [
  {
    value: "light",
    label: "Claro",
    icon: (
      <svg {...icon} aria-hidden>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    value: "dark",
    label: "Escuro",
    icon: (
      <svg {...icon} aria-hidden>
        <path d="M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    value: "system",
    label: "Sistema",
    icon: (
      <svg {...icon} aria-hidden>
        <rect x="3" y="4.5" width="18" height="12" rx="2" />
        <path d="M8 20h8M12 16.5V20" strokeLinecap="round" />
      </svg>
    ),
  },
];

/** Alternador Claro / Escuro / Sistema (sol, lua e monitor). */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  return (
    <div
      role="group"
      aria-label="Tema da interface"
      className={`inline-flex rounded-lg border border-line bg-subtle p-0.5 ${className}`}
    >
      {OPTIONS.map((o) => {
        const ativo = theme === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => setTheme(o.value)}
            aria-pressed={ativo}
            aria-label={`Tema ${o.label}`}
            title={o.label}
            className={`flex h-7 w-8 items-center justify-center rounded-md transition-colors ${
              ativo ? "bg-surface text-fg shadow-sm" : "text-muted hover:text-fg"
            }`}
          >
            {o.icon}
          </button>
        );
      })}
    </div>
  );
}
