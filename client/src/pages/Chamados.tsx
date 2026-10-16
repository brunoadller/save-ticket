import { useMemo, useState } from "react";
import { useTickets } from "../hooks/useTickets";
import { Ticket } from "../types";
import { TicketStats } from "../components/tickets/TicketStats";
import { TicketFilters, Filtros } from "../components/tickets/TicketFilters";
import { TicketList } from "../components/tickets/TicketList";
import { TicketFormModal } from "../components/tickets/TicketFormModal";

export function Chamados() {
  const { tickets, carregando, erro, criar, editar, concluir, reabrir, excluir } = useTickets();
  const [filtros, setFiltros] = useState<Filtros>({ busca: "", polo: "", status: "" });
  const [modalAberto, setModalAberto] = useState(false);
  const [emEdicao, setEmEdicao] = useState<Ticket | null>(null);

  const filtrados = useMemo(() => {
    const q = filtros.busca.trim().toLowerCase();
    const qDigits = q.replace(/\D/g, "");
    return tickets.filter((t) => {
      if (filtros.polo && t.polo !== filtros.polo) return false;
      if (filtros.status && t.status !== filtros.status) return false;
      if (!q) return true;
      return (
        t.protocolo.toLowerCase().includes(q) ||
        t.nomeAluno.toLowerCase().includes(q) ||
        (qDigits.length > 0 && t.cpf.replace(/\D/g, "").includes(qDigits))
      );
    });
  }, [tickets, filtros]);

  function abrirNovo() {
    setEmEdicao(null);
    setModalAberto(true);
  }

  async function handleExcluir(t: Ticket) {
    if (!confirm(`Excluir o chamado de ${t.nomeAluno}?`)) return;
    await excluir(t.id);
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-ink-900">Chamados</h2>
          <p className="text-sm text-ink-700/60">Acompanhe protocolos, previsões e conclusões.</p>
        </div>
        <button
          onClick={abrirNovo}
          className="bg-ink-900 text-white text-sm font-medium rounded px-4 py-2 hover:bg-ink-800"
        >
          Novo chamado
        </button>
      </div>

      {erro && <p className="text-sm text-danger bg-danger/10 rounded px-3 py-2">{erro}</p>}

      <TicketStats tickets={tickets} ativo={filtros.status} onSelect={(status) => setFiltros({ ...filtros, status })} />

      <TicketFilters value={filtros} onChange={setFiltros} />

      <TicketList
        tickets={filtrados}
        carregando={carregando}
        vazioMensagem={
          tickets.length === 0
            ? "Nenhum chamado cadastrado ainda. Clique em “Novo chamado”."
            : "Nenhum chamado encontrado com esses filtros."
        }
        onEdit={(t) => {
          setEmEdicao(t);
          setModalAberto(true);
        }}
        onToggleConcluido={(t) => (t.status === "CONCLUIDO" ? reabrir(t.id) : concluir(t.id))}
        onExcluir={handleExcluir}
      />

      {modalAberto && (
        <TicketFormModal
          ticketExistente={emEdicao}
          onClose={() => setModalAberto(false)}
          onSubmit={(data) => (emEdicao ? editar(emEdicao.id, data) : criar(data))}
        />
      )}
    </div>
  );
}
