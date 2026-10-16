import { ReactNode } from "react";

export const inputClass =
  "w-full rounded border border-ink-900/15 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent/30";

interface Props {
  label: string;
  children: ReactNode;
  className?: string;
}

export function Field({ label, children, className = "" }: Props) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-ink-800 mb-1">{label}</label>
      {children}
    </div>
  );
}
