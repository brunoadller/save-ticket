import { Router } from "express";
import { login, me, createUser, listUsers } from "../controllers/auth.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

router.post("/login", asyncHandler(login));
router.get("/me", requireAuth, asyncHandler(me));

// Somente administradores podem cadastrar novos colegas de equipe
router.post("/users", requireAuth, requireAdmin, asyncHandler(createUser));
router.get("/users", requireAuth, requireAdmin, asyncHandler(listUsers));

export default router;
