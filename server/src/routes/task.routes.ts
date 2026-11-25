import { Router } from "express";
import { listTasks, createTask, updateTask, deleteTask } from "../controllers/task.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.get("/", asyncHandler(listTasks));
router.post("/", asyncHandler(createTask));
router.patch("/:id", asyncHandler(updateTask));
router.delete("/:id", asyncHandler(deleteTask));

export default router;
