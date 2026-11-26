import { Request, Response } from "express";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

// Todo nome é gravado em maiúsculas e sem espaços sobrando, para não duplicar cursos
const courseSchema = z.object({
  name: z
    .string()
    .transform((s) => s.trim().replace(/\s+/g, " ").toLocaleUpperCase("pt-BR"))
    .pipe(z.string().min(2, "Informe o nome do curso.").max(120, "Nome de curso muito longo.")),
});

const courseSelect = { id: true, name: true };
const DUPLICATE_MESSAGE = "Esse curso já está na lista.";

function isDuplicate(err: unknown) {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
}

export async function listCourses(_req: Request, res: Response) {
  const courses = await prisma.course.findMany({ select: courseSelect, orderBy: { name: "asc" } });
  return res.json(courses);
}

export async function createCourse(req: Request, res: Response) {
  const parsed = courseSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

  try {
    const course = await prisma.course.create({ data: { name: parsed.data.name }, select: courseSelect });
    return res.status(201).json(course);
  } catch (err) {
    if (isDuplicate(err)) return res.status(409).json({ error: DUPLICATE_MESSAGE });
    throw err;
  }
}

export async function renameCourse(req: Request, res: Response) {
  const parsed = courseSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

  const existing = await prisma.course.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: "Curso não encontrado." });

  const { name } = parsed.data;
  try {
    // Os chamados guardam o nome em texto: a correção vale para eles também
    const [course] = await prisma.$transaction([
      prisma.course.update({ where: { id: existing.id }, data: { name }, select: courseSelect }),
      prisma.ticket.updateMany({ where: { curso: existing.name }, data: { curso: name } }),
    ]);
    return res.json(course);
  } catch (err) {
    if (isDuplicate(err)) return res.status(409).json({ error: DUPLICATE_MESSAGE });
    throw err;
  }
}
