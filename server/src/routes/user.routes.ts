import { Router } from "express";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

// Lista enxuta para os seletores (criado por / responsável): nunca expõe e-mail nem hash.
router.get("/", asyncHandler(async (_req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  res.json(users);
}));

export default router;
