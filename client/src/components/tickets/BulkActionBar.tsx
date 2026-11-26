interface Props {
  count: number;
  onClear: () => void;
  onDelete: () => void;
}

/** Barra fixa no rodapé com as ações da seleção (aparece com 1 ou mais chamados marcados). */
export function BulkActionBar({ count, onClear, onDelete }: Props) {
  return (
    <div
      role="region"
      data-bottom-bar
      aria-label="Ações para os chamados selecionados"
      className="!m-0 fixed bottom-0 inset-x-0 md:left-56 z-40 px-4 pb-4 pointer-events-none"
    >
      <div className="max-w-3xl mx-auto pointer-events-auto flex flex-wrap items-center justify-between gap-3 bg-elevated border border-line shadow-card rounded-xl px-4 py-3">
        <p className="text-sm font-medium text-fg" aria-live="polite">
          <span className="inline-block h-2 w-2 rounded-full bg-accent-fill mr-2 align-middle" aria-hidden />
          {count} {count === 1 ? "selecionado" : "selecionados"}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClear}
            className="px-3 py-1.5 text-sm rounded-md border border-line-strong text-fg hover:bg-subtle"
          >
            Limpar seleção
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="px-3 py-1.5 text-sm rounded-md bg-danger text-on-solid font-medium hover:opacity-90"
          >
            Excluir selecionados
          </button>
        </div>
      </div>
    </div>
  );
}
