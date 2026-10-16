import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { dayStr, isPastDay } from "../utils/date";

const taskSchema = z.object({
  titulo: z.string().trim().min(1, "Título obrigatório."),
  descricao: z.string().optional().default(""),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida (use AAAA-MM-DD)."),
});

const updateTaskSchema = taskSchema.partial().extend({
  concluida: z.boolean().optional(),
});

function withAtraso<T extends { data: Date; concluida: boolean }>(task: T) {
  return {
    ...task,
    data: dayStr(task.data),
    atrasada: !task.concluida && isPastDay(task.data),
  };
}

const include = { createdBy: { select: { id: true, name: true } } };

// GET /tasks?ano=2026     → tarefas do ano (visão de blocos por mês)
// GET /tasks?mes=2026-07  → tarefas do mês | sem filtro → todas
// GET /tasks?atrasadas=1  → só as atrasadas (para o aviso global)
export async function listTasks(req: Request, res: Response) {
  const { mes, ano, atrasadas } = req.query;
  const where: any = {};

  if (typeof ano === "string" && /^\d{4}$/.test(ano)) {
    const y = Number(ano);
    where.data = { gte: new Date(Date.UTC(y, 0, 1)), lt: new Date(Date.UTC(y + 1, 0, 1)) };
  }

  if (typeof mes === "string" && /^\d{4}-\d{2}$/.test(mes)) {
    const [y, m] = mes.split("-").map(Number);
    where.data = { gte: new Date(Date.UTC(y, m - 1, 1)), lt: new Date(Date.UTC(y, m, 1)) };
  }

  const tasks = await prisma.task.findMany({ where, include, orderBy: [{ data: "asc" }, { createdAt: "asc" }] });
  let result = tasks.map(withAtraso);
  if (atrasadas) result = result.filter((t: { atrasada: boolean }) => t.atrasada);
  return res.json(result);
}

export async function createTask(req: Request, res: Response) {
  const parsed = taskSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

  const { data, ...rest } = parsed.data;
  const task = await prisma.task.create({
    data: { ...rest, data: new Date(`${data}T00:00:00.000Z`), userId: req.user!.userId },
    include,
  });
  return res.status(201).json(withAtraso(task));
}

export async function updateTask(req: Request, res: Response) {
  const parsed = updateTaskSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

  const existente = await prisma.task.findUnique({ where: { id: req.params.id } });
  if (!existente) return res.status(404).json({ error: "Tarefa não encontrada." });

  const { data, concluida, ...rest } = parsed.data;
  const task = await prisma.task.update({
    where: { id: req.params.id },
    data: {
      ...rest,
      ...(data ? { data: new Date(`${data}T00:00:00.000Z`) } : {}),
      ...(concluida !== undefined ? { concluida, concluidaEm: concluida ? new Date() : null } : {}),
    },
    include,
  });
  return res.json(withAtraso(task));
}

export async function deleteTask(req: Request, res: Response) {
  const existente = await prisma.task.findUnique({ where: { id: req.params.id } });
  if (!existente) return res.status(404).json({ error: "Tarefa não encontrada." });
  await prisma.task.delete({ where: { id: req.params.id } });
  return res.status(204).send();
}
