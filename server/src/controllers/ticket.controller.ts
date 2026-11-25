import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { Polo, StudentStatus, TicketStatus } from "@prisma/client";
import { isPastDay } from "../utils/date";

const poloEnum = z.nativeEnum(Polo);

const ticketSchema = z.object({
  protocolo: z.string().min(1, "Protocolo obrigatório."),
  polo: poloEnum,
  nomeAluno: z.string().min(1, "Nome do aluno obrigatório."),
  cpf: z.string().min(11, "CPF inválido."),
  ra: z.string().optional(),
  curso: z.string().optional(),
  situacaoAtual: z.nativeEnum(StudentStatus).nullable().optional(),
  telefone: z.string().optional(),
  assignedToId: z.string().uuid().nullable().optional(),
  justificativa: z.string().optional(),
  dataCriacao: z.coerce.date().optional(),
  dataPrazo: z.coerce.date(),
});

const bulkDeleteSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "Nenhum chamado informado.").max(200, "Máximo de 200 chamados por vez."),
});

const personSelect = { select: { id: true, name: true } };
const ticketInclude = { createdBy: personSelect, assignedTo: personSelect };

function canDelete(ticket: { userId: string }, user: { userId: string; role: string }) {
  return user.role === "ADMIN" || ticket.userId === user.userId;
}

const updateTicketSchema = ticketSchema.partial().extend({
  status: z.nativeEnum(TicketStatus).optional(),
});

// Calcula o status "efetivo" do chamado: se já foi marcado como concluído,
// mantém; caso contrário, compara o prazo com a data atual.
function computeEffectiveStatus<T extends { status: TicketStatus; dataPrazo: Date }>(
  ticket: T
): T {
  if (ticket.status === "CONCLUIDO") return ticket;
  // Vence só depois do dia do prazo (comparação por dia, fuso de Pelotas/RS)
  const expirado = isPastDay(ticket.dataPrazo);
  return { ...ticket, status: expirado ? "EXPIRADO" : "ANDAMENTO" };
}

export async function listTickets(req: Request, res: Response) {
  const { polo, status } = req.query;

  const tickets = await prisma.ticket.findMany({
    where: { ...(polo ? { polo: polo as Polo } : {}) },
    include: ticketInclude,
    orderBy: { dataPrazo: "asc" },
  });

  // O status "EXPIRADO" não é gravado no banco (é calculado), então o filtro roda aqui.
  const comStatusAtualizado = tickets
    .map(computeEffectiveStatus)
    .filter((t) => (status ? t.status === status : true));
  return res.json(comStatusAtualizado);
}

export async function getTicket(req: Request, res: Response) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: req.params.id },
    include: ticketInclude,
  });

  if (!ticket) return res.status(404).json({ error: "Chamado não encontrado." });
  return res.json(computeEffectiveStatus(ticket));
}

export async function createTicket(req: Request, res: Response) {
  const parsed = ticketSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const data = parsed.data;

  // O responsável vem preenchido com o criador, mas pode ser trocado (null = sem responsável)
  const assignedToId = data.assignedToId === undefined ? req.user!.userId : data.assignedToId;
  if (assignedToId && !(await prisma.user.findUnique({ where: { id: assignedToId } }))) {
    return res.status(400).json({ error: "Responsável não encontrado." });
  }

  const ticket = await prisma.ticket.create({
    data: {
      ...data,
      assignedToId,
      dataCriacao: data.dataCriacao ?? new Date(),
      userId: req.user!.userId,
    },
    include: ticketInclude,
  });

  return res.status(201).json(computeEffectiveStatus(ticket));
}

export async function updateTicket(req: Request, res: Response) {
  const parsed = updateTicketSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const existente = await prisma.ticket.findUnique({ where: { id: req.params.id } });
  if (!existente) return res.status(404).json({ error: "Chamado não encontrado." });

  const { status, ...resto } = parsed.data;
  if (resto.assignedToId && !(await prisma.user.findUnique({ where: { id: resto.assignedToId } }))) {
    return res.status(400).json({ error: "Responsável não encontrado." });
  }
  const ticket = await prisma.ticket.update({
    where: { id: req.params.id },
    include: ticketInclude,
    data: {
      ...resto,
      ...(status === "CONCLUIDO" ? { status, dataConclusao: new Date() } : {}),
      // reabrir: volta para andamento (o "expirado" é recalculado pelo prazo)
      ...(status === "ANDAMENTO" || status === "EXPIRADO"
        ? { status: "ANDAMENTO" as TicketStatus, dataConclusao: null }
        : {}),
    },
  });

  return res.json(computeEffectiveStatus(ticket));
}

export async function deleteTicket(req: Request, res: Response) {
  const existente = await prisma.ticket.findUnique({ where: { id: req.params.id } });
  if (!existente) return res.status(404).json({ error: "Chamado não encontrado." });

  if (!canDelete(existente, req.user!)) {
    return res.status(403).json({ error: "Só o criador do chamado ou um administrador pode excluí-lo." });
  }

  await prisma.ticket.delete({ where: { id: req.params.id } });
  return res.status(204).send();
}

export async function bulkDeleteTickets(req: Request, res: Response) {
  const parsed = bulkDeleteSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  const ids = [...new Set(parsed.data.ids)];

  // Tudo ou nada: se algum chamado não for permitido, nada é excluído.
  const result = await prisma.$transaction(async (tx) => {
    const found = await tx.ticket.findMany({ where: { id: { in: ids } }, select: { id: true, userId: true } });
    const forbidden = found.filter((t) => !canDelete(t, req.user!));
    if (forbidden.length > 0) return { forbidden: forbidden.length, deleted: 0 };
    const { count } = await tx.ticket.deleteMany({ where: { id: { in: found.map((t) => t.id) } } });
    return { forbidden: 0, deleted: count };
  });

  if (result.forbidden > 0) {
    return res.status(403).json({
      error: "Você não tem permissão para excluir alguns dos chamados selecionados. Nenhum foi excluído.",
    });
  }
  return res.json({ deleted: result.deleted });
}
