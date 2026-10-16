import { ReactNode } from "react";

interface Props {
  title: string;
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
}

export function Modal({ title, onClose, children, maxWidth = "max-w-2xl" }: Props) {
  return (
    <div className="fixed inset-0 bg-ink-900/40 flex items-start justify-center overflow-y-auto py-10 px-4 z-50">
      <div className={`bg-white rounded-lg w-full ${maxWidth} p-6`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-ink-900">{title}</h2>
          <button onClick={onClose} className="text-ink-700/60 hover:text-ink-900 text-sm">
            Fechar
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
