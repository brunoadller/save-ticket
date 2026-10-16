import { useMemo, useState } from "react";
import { useTasks } from "../hooks/useTasks";
import { useTickets } from "../hooks/useTickets";
import { Task, Ticket } from "../types";
import { MESES, dateOnly, monthOf, todayStr } from "../lib/dates";
import { YearView } from "../components/calendar/YearView";
import { MonthView } from "../components/calendar/MonthView";
import { DayPanel } from "../components/calendar/DayPanel";
import { ResumoMes } from "../components/calendar/MonthCard";
import { TaskItem } from "../components/calendar/TaskItem";

function agrupar<T>(itens: T[], chave: (i: T) => string) {
  const out: Record<string, T[]> = {};
  for (const i of itens) (out[chave(i)] ??= []).push(i);
  return out;
}

export function Calendario() {
  const hoje = todayStr();
  const anoAtual = Number(hoje.slice(0, 4));
  const [ano, setAno] = useState(anoAtual);
  const [mes, setMes] = useState<number | null>(null);
  const [dia, setDia] = useState<string | null>(null);

  const { tasks, carregando, erro, criar, editar, alternar, excluir } = useTasks(ano);
  const { tickets } = useTickets();

  const chamadosDoAno = useMemo(
    () => tickets.filter((t) => dateOnly(t.dataPrazo).startsWith(`${ano}-`)),
    [tickets, ano]
  );

  const resumos: ResumoMes[] = useMemo(
    () =>
      Array.from({ length: 12 }, (_, m) => {
        const doMes = tasks.filter((t) => monthOf(t.data) === m);
        return {
          total: doMes.length,
          concluidas: doMes.filter((t) => t.concluida).length,
          atrasadas: doMes.filter((t) => t.atrasada).length,
          chamados: chamadosDoAno.filter((c) => monthOf(c.dataPrazo) === m && c.status !== "CONCLUIDO").length,
        };
      }),
    [tasks, chamadosDoAno]
  );

  const totalAtrasadas = resumos.reduce((s, r) => s + r.atrasadas, 0);
  const primeiroMesAtrasado = resumos.findIndex((r) => r.atrasadas > 0);

  const tarefasPorDia = useMemo(() => agrupar(tasks, (t) => t.data), [tasks]);
  const chamadosPorDia = useMemo(() => agrupar(chamadosDoAno, (c) => dateOnly(c.dataPrazo)), [chamadosDoAno]);

  function abrirMes(m: number) {
    setMes(m);
    setDia(null);
  }

  function mudarMes(delta: number) {
    if (mes === null) return;
    const novo = mes + delta;
    if (novo < 0) {
      setAno(ano - 1);
      setMes(11);
    } else if (novo > 11) {
      setAno(ano + 1);
      setMes(0);
    } else setMes(novo);
    setDia(null);
  }

  const tarefasDoMes: Task[] = mes === null ? [] : tasks.filter((t) => monthOf(t.data) === mes);
  const diaInicialNovaTarefa =
    mes !== null && hoje.startsWith(`${ano}-`) && monthOf(hoje) === mes
      ? hoje
      : mes !== null
      ? `${ano}-${String(mes + 1).padStart(2, "0")}-01`
      : hoje;

  const navBtn = "px-2.5 py-1.5 text-sm rounded border border-ink-900/15 text-ink-800 hover:bg-white";

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          {mes !== null && (
            <button onClick={() => setMes(null)} className="text-xs text-accent hover:underline">
              ← Voltar para {ano}
            </button>
          )}
          <h2 className="text-xl font-semibold text-ink-900">
            {mes === null ? `Calendário ${ano}` : `${MESES[mes]} de ${ano}`}
          </h2>
          <p className="text-sm text-ink-700/60">
            {mes === null
              ? "Escolha um mês para programar as tarefas."
              : "Clique em um dia para ver e adicionar tarefas."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {mes === null ? (
            <>
              <button className={navBtn} onClick={() => setAno(ano - 1)} aria-label="Ano anterior">
                ‹
              </button>
              <button className={navBtn} onClick={() => setAno(anoAtual)}>
                Hoje
              </button>
              <button className={navBtn} onClick={() => setAno(ano + 1)} aria-label="Próximo ano">
                ›
              </button>
            </>
          ) : (
            <>
              <button className={navBtn} onClick={() => mudarMes(-1)} aria-label="Mês anterior">
                ‹
              </button>
              <button className={navBtn} onClick={() => mudarMes(1)} aria-label="Próximo mês">
                ›
              </button>
              <button
                className="bg-ink-900 text-white text-sm font-medium rounded px-4 py-1.5 hover:bg-ink-800"
                onClick={() => setDia(diaInicialNovaTarefa)}
              >
                Nova tarefa
              </button>
            </>
          )}
        </div>
      </div>

      {erro && <p className="text-sm text-danger bg-danger/10 rounded px-3 py-2">{erro}</p>}

      {totalAtrasadas > 0 && (
        <div className="flex items-center justify-between gap-3 border border-danger/30 bg-danger/10 rounded-lg px-4 py-3">
          <p className="text-sm text-danger">
            <strong>
              {totalAtrasadas} tarefa{totalAtrasadas > 1 ? "s" : ""} atrasada{totalAtrasadas > 1 ? "s" : ""}
            </strong>{" "}
            em {ano}. O prazo passou e ainda não foram concluídas.
          </p>
          {primeiroMesAtrasado >= 0 && (
            <button onClick={() => abrirMes(primeiroMesAtrasado)} className="text-sm text-danger underline shrink-0">
              Ver em {MESES[primeiroMesAtrasado]}
            </button>
          )}
        </div>
      )}

      {carregando ? (
        <p className="text-sm text-ink-700/60">Carregando calendário…</p>
      ) : mes === null ? (
        <YearView
          ano={ano}
          mesAtual={ano === anoAtual ? monthOf(hoje) : null}
          resumos={resumos}
          onSelecionarMes={abrirMes}
        />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          <div className="xl:col-span-2">
            <MonthView
              ano={ano}
              mes={mes}
              tarefasPorDia={tarefasPorDia}
              chamadosPorDia={chamadosPorDia}
              selecionado={dia}
              onSelecionarDia={setDia}
            />
          </div>

          <div>
            {dia ? (
              <DayPanel
                dia={dia}
                tarefas={tarefasPorDia[dia] ?? []}
                chamados={chamadosPorDia[dia] ?? ([] as Ticket[])}
                onCriar={criar}
                onEditar={editar}
                onAlternar={alternar}
                onExcluir={(t) => excluir(t.id)}
                onFechar={() => setDia(null)}
              />
            ) : (
              <div className="bg-white border border-ink-900/10 rounded-lg p-4 space-y-3">
                <h3 className="text-sm font-semibold text-ink-900">Tarefas de {MESES[mes]}</h3>
                {tarefasDoMes.length === 0 ? (
                  <p className="text-sm text-ink-700/60">
                    Nada programado neste mês. Clique em um dia para adicionar.
                  </p>
                ) : (
                  tarefasDoMes.map((t) => (
                    <div key={t.id}>
                      <p className="text-[11px] text-ink-700/50 mb-1">
                        {t.data.slice(8)}/{t.data.slice(5, 7)}
                      </p>
                      <TaskItem
                        tarefa={t}
                        onToggle={() => alternar(t)}
                        onEditar={(d) => editar(t.id, d)}
                        onExcluir={() => confirm(`Excluir a tarefa “${t.titulo}”?`) && excluir(t.id)}
                      />
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
