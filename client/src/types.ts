export type Polo = "PELOTAS_I" | "PELOTAS_II" | "PELOTAS_III";
export type StudentStatus = "ATIVO" | "FORMANDO" | "CONCLUIDO" | "DESISTENTE" | "SEM_MATRICULA";
export type TicketStatus = "ANDAMENTO" | "CONCLUIDO" | "EXPIRADO";

export interface Person {
  id: string;
  name: string;
}

export interface Ticket {
  id: string;
  protocolo: string;
  polo: Polo;
  nomeAluno: string;
  cpf: string;
  ra: string;
  curso: string;
  telefone: string;
  situacaoAtual: StudentStatus | null;
  situacaoAtualLegado: string; // texto livre antigo, anterior à lista fixa
  justificativa: string;
  status: TicketStatus;
  dataCriacao: string; // "data de realização"
  dataPrazo: string; // "data de previsão"
  dataConclusao: string | null;
  createdBy?: Person;
  assignedTo?: Person | null;
}

export interface TicketFormData {
  protocolo: string;
  polo: Polo;
  nomeAluno: string;
  cpf: string;
  dataCriacao: string; // AAAA-MM-DD
  dataPrazo: string; // AAAA-MM-DD
  telefone: string;
  ra: string;
  curso: string;
  situacaoAtual: StudentStatus | ""; // "" = não informada
  assignedToId: string; // "" = sem responsável
  justificativa: string;
}

export interface Task {
  id: string;
  titulo: string;
  descricao: string;
  data: string; // AAAA-MM-DD
  concluida: boolean;
  concluidaEm: string | null;
  atrasada: boolean;
  createdBy?: { id: string; name: string };
}

export interface TaskFormData {
  titulo: string;
  descricao: string;
  data: string;
}
