import { useCallback, useEffect, useState } from "react";
import api from "../api/axios";
import { Ticket, TicketFormData } from "../types";

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
    await api.post("/tickets", data);
    await carregar();
  };
  const editar = async (id: string, data: Partial<TicketFormData>) => {
    await api.patch(`/tickets/${id}`, data);
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

  return { tickets, carregando, erro, criar, editar, concluir, reabrir, excluir };
}
