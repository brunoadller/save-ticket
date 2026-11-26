import { Router } from "express";
import { listCourses, createCourse, renameCourse } from "../controllers/course.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.get("/", asyncHandler(listCourses));
router.post("/", asyncHandler(createCourse));
router.patch("/:id", asyncHandler(renameCourse));

export default router;
