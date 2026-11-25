import { Person, Ticket, TicketStatus } from "../types";
import { dateOnly, todayStr, weekRange } from "./dates";

/** Valor especial do filtro de responsável para chamados sem responsável. */
export const SEM_RESPONSAVEL = "sem";

export type SortKey = "prazo" | "realizacao" | "aluno";
export type SortDir = "asc" | "desc";

export interface TicketFilters {
  criador: string; // id do usuário
  responsavel: string; // id do usuário ou SEM_RESPONSAVEL
  polo: string;
  status: TicketStatus | "";
  de: string; // AAAA-MM-DD (data de previsão)
  ate: string; // AAAA-MM-DD
  atrasados: boolean; // previsão anterior a hoje e não concluído
  q: string;
  ordem: SortKey;
  dir: SortDir;
}

export const EMPTY_FILTERS: TicketFilters = {
  criador: "",
  responsavel: "",
  polo: "",
  status: "",
  de: "",
  ate: "",
  atrasados: false,
  q: "",
  ordem: "prazo",
  dir: "asc",
};

const STATUSES: TicketStatus[] = ["ANDAMENTO", "EXPIRADO", "CONCLUIDO"];
const ORDENS: SortKey[] = ["prazo", "realizacao", "aluno"];

/** Lê os filtros da query string (valores inválidos são ignorados). */
export function filtersFromParams(p: URLSearchParams): TicketFilters {
  const status = p.get("status") ?? "";
  const ordem = p.get("ordem") as SortKey;
  const data = (k: string) => (/^\d{4}-\d{2}-\d{2}$/.test(p.get(k) ?? "") ? p.get(k)! : "");
  return {
    criador: p.get("criador") ?? "",
    responsavel: p.get("responsavel") ?? "",
    polo: p.get("polo") ?? "",
    status: STATUSES.includes(status as TicketStatus) ? (status as TicketStatus) : "",
    de: data("de"),
    ate: data("ate"),
    atrasados: p.get("atrasados") === "1",
    q: p.get("q") ?? "",
    ordem: ORDENS.includes(ordem) ? ordem : "prazo",
    dir: p.get("dir") === "desc" ? "desc" : "asc",
  };
}

/** Só grava na URL o que difere do padrão. */
export function filtersToParams(f: TicketFilters): URLSearchParams {
  const p = new URLSearchParams();
  (["criador", "responsavel", "polo", "status", "de", "ate", "q"] as const).forEach((k) => {
    if (f[k]) p.set(k, f[k]);
  });
  if (f.atrasados) p.set("atrasados", "1");
  if (f.ordem !== "prazo") p.set("ordem", f.ordem);
  if (f.dir !== "asc") p.set("dir", f.dir);
  return p;
}

/** Quantidade de filtros ativos (ordenação não conta). */
export function countActiveFilters(f: TicketFilters) {
  return (
    [f.criador, f.responsavel, f.polo, f.status, f.q.trim()].filter(Boolean).length +
    (f.de || f.ate ? 1 : 0) +
    (f.atrasados ? 1 : 0)
  );
}

export function clearFilters(f: TicketFilters): TicketFilters {
  return { ...EMPTY_FILTERS, ordem: f.ordem, dir: f.dir };
}

/** Atalhos de período pela data de previsão. */
export function periodShortcut(kind: "hoje" | "semana", today = todayStr()) {
  if (kind === "hoje") return { de: today, ate: today };
  const { start, end } = weekRange(today);
  return { de: start, ate: end };
}

function normalize(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}
const digits = (s: string) => s.replace(/\D/g, "");

/** Busca em protocolo, aluno, CPF, telefone e RA; CPF e telefone casam com ou sem máscara. */
export function matchesSearch(t: Ticket, query: string) {
  const q = normalize(query.trim());
  if (!q) return true;
  if (
    normalize(t.protocolo).includes(q) ||
    normalize(t.nomeAluno).includes(q) ||
    normalize(t.ra ?? "").includes(q) ||
    normalize(t.cpf).includes(q) ||
    normalize(t.telefone ?? "").includes(q)
  )
    return true;
  // Só compara dígitos quando a busca parece um número (evita "CS44172141" casar com CPF)
  if (/^[\d\s.\-()+/]+$/.test(q)) {
    const qd = digits(q);
    return qd.length > 0 && (digits(t.cpf).includes(qd) || digits(t.telefone ?? "").includes(qd));
  }
  return false;
}

/**
 * Função pura de filtragem (pode migrar para o servidor depois).
 * `ignoreStatus` é usado pelos cartões de contagem, que não seguem o filtro de status.
 */
export function filterTickets(
  tickets: Ticket[],
  f: TicketFilters,
  opts: { ignoreStatus?: boolean; today?: string } = {}
) {
  const today = opts.today ?? todayStr();
  return tickets.filter((t) => {
    if (f.criador && t.createdBy?.id !== f.criador) return false;
    if (f.responsavel) {
      if (f.responsavel === SEM_RESPONSAVEL ? !!t.assignedTo : t.assignedTo?.id !== f.responsavel) return false;
    }
    if (f.polo && t.polo !== f.polo) return false;
    if (!opts.ignoreStatus && f.status && t.status !== f.status) return false;
    const prazo = dateOnly(t.dataPrazo);
    if (f.de && prazo < f.de) return false;
    if (f.ate && prazo > f.ate) return false;
    if (f.atrasados && !(prazo < today && t.status !== "CONCLUIDO")) return false;
    return matchesSearch(t, f.q);
  });
}

export function sortTickets(tickets: Ticket[], ordem: SortKey, dir: SortDir) {
  const sign = dir === "asc" ? 1 : -1;
  const key = (t: Ticket) =>
    ordem === "aluno" ? normalize(t.nomeAluno) : dateOnly(ordem === "prazo" ? t.dataPrazo : t.dataCriacao);
  return [...tickets].sort((a, b) => {
    const ka = key(a);
    const kb = key(b);
    return ka === kb ? 0 : ka < kb ? -sign : sign;
  });
}

export interface PersonOption extends Person {
  count: number;
}

/** Pessoas para os seletores: equipe atual + quem aparece em chamados mas não está mais na lista. */
export function personOptions(users: Person[], tickets: Ticket[], pick: (t: Ticket) => Person | null | undefined) {
  const map = new Map<string, PersonOption>();
  users.forEach((u) => map.set(u.id, { ...u, count: 0 }));
  let semPessoa = 0;
  for (const t of tickets) {
    const p = pick(t);
    if (!p) {
      semPessoa++;
      continue;
    }
    const cur = map.get(p.id) ?? { ...p, count: 0 };
    cur.count++;
    map.set(p.id, cur);
  }
  const list = [...map.values()].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  return { list, semPessoa };
}
