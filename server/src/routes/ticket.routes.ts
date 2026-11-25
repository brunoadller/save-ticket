import { Router } from "express";
import {
  listTickets,
  getTicket,
  createTicket,
  updateTicket,
  deleteTicket,
  bulkDeleteTickets,
} from "../controllers/ticket.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.get("/", asyncHandler(listTickets));
router.get("/:id", asyncHandler(getTicket));
router.post("/", asyncHandler(createTicket));
router.patch("/:id", asyncHandler(updateTicket));
router.delete("/bulk", asyncHandler(bulkDeleteTickets)); // antes de "/:id"
router.delete("/:id", asyncHandler(deleteTicket));

export default router;
