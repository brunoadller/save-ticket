import { useCallback, useEffect, useState } from "react";
import api from "../api/axios";
import { Ticket, TicketFormData } from "../types";

/** Converte os campos "vazios" do formulário em null para a API. */
function toPayload(data: Partial<TicketFormData>) {
  const { situacaoAtual, assignedToId, ...rest } = data;
  return {
    ...rest,
    ...(situacaoAtual !== undefined ? { situacaoAtual: situacaoAtual || null } : {}),
    ...(assignedToId !== undefined ? { assignedToId: assignedToId || null } : {}),
  };
}

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      const { data } = await api.get<Ticket[]>("/tickets");
      setTickets(data);
      setErro(null);
    } catch {
      setErro("Não foi possível carregar os chamados.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const criar = async (data: TicketFormData) => {
    await api.post("/tickets", toPayload(data));
    await carregar();
  };
  const editar = async (id: string, data: Partial<TicketFormData>) => {
    await api.patch(`/tickets/${id}`, toPayload(data));
    await carregar();
  };
  const concluir = async (id: string) => {
    await api.patch(`/tickets/${id}`, { status: "CONCLUIDO" });
    await carregar();
  };
  const reabrir = async (id: string) => {
    await api.patch(`/tickets/${id}`, { status: "ANDAMENTO" });
    await carregar();
  };
  const excluir = async (id: string) => {
    await api.delete(`/tickets/${id}`);
    await carregar();
  };

  /** Exclui em lotes de até 200 (limite da API). Cada lote é tudo-ou-nada no servidor. */
  const excluirEmLote = async (ids: string[]) => {
    let total = 0;
    try {
      for (let i = 0; i < ids.length; i += 200) {
        const { data } = await api.delete<{ deleted: number }>("/tickets/bulk", {
          data: { ids: ids.slice(i, i + 200) },
        });
        total += data.deleted;
      }
    } finally {
      await carregar();
    }
    return total;
  };

  return { tickets, carregando, erro, criar, editar, concluir, reabrir, excluir, excluirEmLote };
}
