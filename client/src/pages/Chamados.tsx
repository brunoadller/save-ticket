import { useEffect, useMemo, useState } from "react";
import { useTickets } from "../hooks/useTickets";
import { useUsers } from "../hooks/useUsers";
import { useTicketFilters } from "../hooks/useTicketFilters";
import { useAuth } from "../context/AuthContext";
import { filterTickets, sortTickets, SortKey } from "../lib/ticketFilters";
import { Ticket } from "../types";
import { TicketStats } from "../components/tickets/TicketStats";
import { TicketFilters } from "../components/tickets/TicketFilters";
import { TicketList } from "../components/tickets/TicketList";
import { BulkActionBar } from "../components/tickets/BulkActionBar";
import { BulkDeleteDialog } from "../components/tickets/BulkDeleteDialog";
import { TicketFormModal } from "../components/tickets/TicketFormModal";

export function Chamados() {
  const { tickets, carregando, erro, criar, editar, alternarConclusao, excluir, excluirEmLote } =
    useTickets();
  const { user } = useAuth();
  const users = useUsers();
  const { filters, update, clear } = useTicketFilters();
  const [modalAberto, setModalAberto] = useState(false);
  const [emEdicao, setEmEdicao] = useState<Ticket | null>(null);

  const filtrados = useMemo(
    () => sortTickets(filterTickets(tickets, filters), filters.ordem, filters.dir),
    [tickets, filters]
  );
  // Cartões de contagem seguem todos os filtros, menos o de status
  const paraCartoes = useMemo(() => filterTickets(tickets, filters, { ignoreStatus: true }), [tickets, filters]);

  // Só o criador ou um administrador pode excluir (a API também confere)
  const excluiveis = useMemo(
    () => filtrados.filter((t) => !!user && (user.role === "ADMIN" || t.createdBy?.id === user.id)),
    [filtrados, user]
  );

  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [confirmando, setConfirmando] = useState(false);
  // A seleção só vale para o que ainda está no resultado filtrado e é excluível
  const selecaoEfetiva = useMemo(
    () => new Set(excluiveis.filter((t) => selecionados.has(t.id)).map((t) => t.id)),
    [excluiveis, selecionados]
  );
  const chamadosSelecionados = useMemo(
    () => excluiveis.filter((t) => selecaoEfetiva.has(t.id)),
    [excluiveis, selecaoEfetiva]
  );

  // Mudou qualquer filtro ou a busca (a ordenação não conta): limpa a seleção
  const chaveFiltros = JSON.stringify({ ...filters, ordem: "", dir: "" });
  useEffect(() => {
    setSelecionados(new Set());
  }, [chaveFiltros]);

  function alternar(id: string, marcado: boolean) {
    setSelecionados((prev) => {
      const novo = new Set(prev);
      if (marcado) novo.add(id);
      else novo.delete(id);
      return novo;
    });
  }

  async function excluirSelecionados() {
    await excluirEmLote(chamadosSelecionados.map((t) => t.id));
    setSelecionados(new Set());
    setConfirmando(false);
  }

  function ordenarPor(key: SortKey) {
    update(filters.ordem === key ? { dir: filters.dir === "asc" ? "desc" : "asc" } : { ordem: key, dir: "asc" });
  }

  function abrirNovo() {
    setEmEdicao(null);
    setModalAberto(true);
  }

  async function handleToggleConcluido(t: Ticket) {
    try {
      await alternarConclusao(t);
    } catch (err: any) {
      alert(err.response?.data?.error || `Não foi possível atualizar o chamado de ${t.nomeAluno}. A alteração foi desfeita.`);
    }
  }

  async function handleExcluir(t: Ticket) {
    if (!confirm(`Excluir o chamado de ${t.nomeAluno}?`)) return;
    try {
      await excluir(t.id);
    } catch (err: any) {
      alert(err.response?.data?.error || "Não foi possível excluir o chamado.");
    }
  }

  return (
    <div className={`max-w-6xl mx-auto px-6 py-8 space-y-6 ${selecaoEfetiva.size > 0 ? "pb-28" : ""}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-fg">Chamados</h2>
          <p className="text-sm text-muted">Acompanhe protocolos, previsões e conclusões.</p>
        </div>
        <button
          onClick={abrirNovo}
          className="bg-btn text-btn-fg text-sm font-medium rounded px-4 py-2 hover:bg-btn-hover"
        >
          Novo chamado
        </button>
      </div>

      {erro && <p className="text-sm text-danger bg-danger/10 rounded px-3 py-2">{erro}</p>}

      <TicketStats tickets={paraCartoes} ativo={filters.status} onSelect={(status) => update({ status })} />

      <TicketFilters
        filters={filters}
        onChange={update}
        onClear={clear}
        tickets={tickets}
        users={users}
        currentUserId={user?.id}
        shown={filtrados.length}
        total={tickets.length}
      />

      <TicketList
        tickets={filtrados}
        ordem={filters.ordem}
        dir={filters.dir}
        onSort={ordenarPor}
        currentUser={user ?? undefined}
        selectedIds={selecaoEfetiva}
        selectableCount={excluiveis.length}
        onToggleSelect={alternar}
        onToggleAll={(marcado) => setSelecionados(marcado ? new Set(excluiveis.map((t) => t.id)) : new Set())}
        carregando={carregando}
        vazioAcao={tickets.length === 0 ? { label: "Novo chamado", onClick: abrirNovo } : { label: "Limpar filtros", onClick: clear }}
        vazioMensagem={
          tickets.length === 0
            ? "Nenhum chamado cadastrado ainda. Comece registrando o primeiro."
            : "Nenhum chamado encontrado com esses filtros."
        }
        onEdit={(t) => {
          setEmEdicao(t);
          setModalAberto(true);
        }}
        onToggleConcluido={handleToggleConcluido}
        onExcluir={handleExcluir}
      />

      {selecaoEfetiva.size > 0 && (
        <BulkActionBar
          count={selecaoEfetiva.size}
          onClear={() => setSelecionados(new Set())}
          onDelete={() => setConfirmando(true)}
        />
      )}

      {confirmando && (
        <BulkDeleteDialog
          tickets={chamadosSelecionados}
          onCancel={() => setConfirmando(false)}
          onConfirm={excluirSelecionados}
        />
      )}

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
