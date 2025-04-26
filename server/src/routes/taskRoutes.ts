import { Router } from "express";
import { fetchAllTasks } from "../controllers/taskController";

const router: Router = Router();

router.get("/fetchAllTasks", fetchAllTasks);

export default router;
