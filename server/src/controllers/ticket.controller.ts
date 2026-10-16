import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { Polo, TicketStatus } from "@prisma/client";
import { isPastDay } from "../utils/date";

const poloEnum = z.nativeEnum(Polo);

const ticketSchema = z.object({
  protocolo: z.string().min(1, "Protocolo obrigatório."),
  polo: poloEnum,
  nomeAluno: z.string().min(1, "Nome do aluno obrigatório."),
  cpf: z.string().min(11, "CPF inválido."),
  ra: z.string().optional(),
  curso: z.string().optional(),
  situacaoAtual: z.string().optional(),
  justificativa: z.string().optional(),
  dataCriacao: z.coerce.date().optional(),
  dataPrazo: z.coerce.date(),
});

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
    include: { createdBy: { select: { id: true, name: true } } },
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
    include: { createdBy: { select: { id: true, name: true } } },
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

  const ticket = await prisma.ticket.create({
    data: {
      ...data,
      dataCriacao: data.dataCriacao ?? new Date(),
      userId: req.user!.userId,
    },
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
  const ticket = await prisma.ticket.update({
    where: { id: req.params.id },
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

  await prisma.ticket.delete({ where: { id: req.params.id } });
  return res.status(204).send();
}
