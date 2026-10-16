import { Router } from "express";
import { login, me, createUser, listUsers } from "../controllers/auth.controller";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

router.post("/login", login);
router.get("/me", requireAuth, me);

// Somente administradores podem cadastrar novos colegas de equipe
router.post("/users", requireAuth, requireAdmin, createUser);
router.get("/users", requireAuth, requireAdmin, listUsers);

export default router;
