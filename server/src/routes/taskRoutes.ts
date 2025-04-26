import { Router } from "express";
import { fetchAllTasks, addTask } from "../controllers/taskController";

const router: Router = Router();

// GET endpoint to fetch all tasks
router.get("/fetchAllTasks", fetchAllTasks);

// POST endpoint to add a new task
router.post("/add", addTask);

export default router;
