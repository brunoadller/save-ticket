import { useCallback, useEffect, useRef, useState } from "react";
import api from "../api/axios";
import { dateOnly, todayStr } from "../lib/dates";
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

/** Como o chamado deve ficar após o clique, antes de a API responder. */
function toggleStatus(t: Ticket): Ticket {
  if (t.status !== "CONCLUIDO") return { ...t, status: "CONCLUIDO", dataConclusao: todayStr() };
  const expirado = dateOnly(t.dataPrazo) < todayStr();
  return { ...t, status: expirado ? "EXPIRADO" : "ANDAMENTO", dataConclusao: null };
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
  // Trocas de status ainda não confirmadas pela API, por chamado
  const pendentes = useRef(new Map<string, { fila: Promise<void>; ultima: number; confirmado: Ticket }>());

  const substituir = (novo: Ticket) => setTickets((prev) => prev.map((t) => (t.id === novo.id ? novo : t)));

  /**
   * Conclui ou reabre com atualização otimista: a tela muda na hora e a API é chamada em segundo plano.
   * Se a última troca falhar, o chamado volta ao estado confirmado e o erro é repassado.
   */
  const alternarConclusao = async (ticket: Ticket) => {
    const { id } = ticket;
    const otimista = toggleStatus(ticket);
    const item = pendentes.current.get(id) ?? { fila: Promise.resolve(), ultima: 0, confirmado: ticket };
    pendentes.current.set(id, item);
    const vez = ++item.ultima;
    substituir(otimista);

    // Em fila: cliques seguidos no mesmo chamado chegam à API na ordem em que foram feitos
    const envio = item.fila.then(async () => {
      const status = otimista.status === "CONCLUIDO" ? "CONCLUIDO" : "ANDAMENTO";
      const { data } = await api.patch<Ticket>(`/tickets/${id}`, { status });
      item.confirmado = data;
    });
    item.fila = envio.catch(() => {});

    try {
      await envio;
    } catch (err) {
      if (vez === item.ultima) {
        substituir(item.confirmado);
        carregar(); // a API pode ter gravado mesmo sem a resposta chegar
        throw err;
      }
    } finally {
      // Só a resposta do último clique mexe na tela, para não "piscar" com um estado antigo
      if (vez === item.ultima) pendentes.current.delete(id);
    }
    if (vez === item.ultima) substituir(item.confirmado);
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

  return { tickets, carregando, erro, recarregar: carregar, criar, editar, alternarConclusao, excluir, excluirEmLote };
}
