import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { clearFilters, filtersFromParams, filtersToParams, TicketFilters } from "../lib/ticketFilters";

/** Filtros guardados na query string: atualizar a página ou copiar o link mantém o estado. */
export function useTicketFilters() {
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => filtersFromParams(params), [params]);

  const update = useCallback(
    (patch: Partial<TicketFilters>) => {
      setParams((prev) => filtersToParams({ ...filtersFromParams(prev), ...patch }), { replace: true });
    },
    [setParams]
  );

  const clear = useCallback(() => {
    setParams((prev) => filtersToParams(clearFilters(filtersFromParams(prev))), { replace: true });
  }, [setParams]);

  return { filters, update, clear };
}
