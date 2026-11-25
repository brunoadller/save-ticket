import { ReactNode } from "react";

export const inputClass =
  "w-full rounded border border-line-strong px-3 py-2 text-sm bg-surface focus:outline-none focus:border-accent";

interface Props {
  label: string;
  children: ReactNode;
  className?: string;
}

export function Field({ label, children, className = "" }: Props) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-fg mb-1">{label}</label>
      {children}
    </div>
  );
}
