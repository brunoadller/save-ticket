import { ReactNode } from "react";

interface Props {
  title: string;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
}

export function Modal({ title, onClose, children, maxWidth = "max-w-2xl" }: Props) {
  return (
    <div className="!m-0 fixed inset-0 bg-black/60 flex items-start justify-center overflow-y-auto py-10 px-4 z-50">
      <div role="dialog" aria-modal="true" aria-label={title} className={`bg-elevated border border-line shadow-card rounded-xl w-full ${maxWidth} p-6`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-fg">{title}</h2>
          <button onClick={onClose} className="text-muted hover:text-fg text-sm">
            Fechar
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
