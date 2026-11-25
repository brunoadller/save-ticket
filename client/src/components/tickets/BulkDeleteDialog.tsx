import { useState } from "react";
import { Ticket } from "../../types";
import { Modal } from "../ui/Modal";

interface Props {
  tickets: Ticket[];
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}

const PREVIEW = 5;

/** Confirmação da exclusão em lote: quantidade, primeiros chamados e aviso de que não há volta. */
export function BulkDeleteDialog({ tickets, onCancel, onConfirm }: Props) {
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const n = tickets.length;

  async function confirmar() {
    setExcluindo(true);
    setErro(null);
    try {
      await onConfirm();
    } catch (err: any) {
      setErro(err.response?.data?.error || err.message || "Não foi possível excluir os chamados.");
      setExcluindo(false);
    }
  }

  return (
    <Modal
      title={`Excluir ${n} ${n === 1 ? "chamado" : "chamados"}?`}
      onClose={excluindo ? () => {} : onCancel}
      maxWidth="max-w-md"
    >
      <div role="alertdialog" aria-describedby="bulk-delete-desc" className="space-y-4">
        <p id="bulk-delete-desc" className="text-sm text-fg">
          Esta ação <strong>não pode ser desfeita</strong>. Serão excluídos:
        </p>
        <ul className="text-sm text-fg space-y-1 bg-subtle rounded px-3 py-2">
          {tickets.slice(0, PREVIEW).map((t) => (
            <li key={t.id} className="truncate">
              <span className="font-mono">{t.protocolo}</span> — {t.nomeAluno}
            </li>
          ))}
          {n > PREVIEW && <li className="text-muted">e mais {n - PREVIEW}…</li>}
        </ul>
        {erro && <p className="text-sm text-danger bg-danger/10 rounded px-3 py-2">{erro}</p>}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            autoFocus
            disabled={excluindo}
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded border border-line text-fg hover:bg-subtle disabled:opacity-60"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={excluindo}
            onClick={confirmar}
            className="px-4 py-2 text-sm rounded bg-danger text-on-solid font-medium hover:opacity-90 disabled:opacity-60"
          >
            {excluindo ? "Excluindo…" : `Excluir ${n}`}
          </button>
        </div>
      </div>
    </Modal>
  );
}
