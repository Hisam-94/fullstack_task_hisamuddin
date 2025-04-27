"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const taskController_1 = require("../controllers/taskController");
const router = (0, express_1.Router)();
// GET endpoint to fetch all tasks
router.get("/fetchAllTasks", taskController_1.fetchAllTasks);
// POST endpoint to add a new task
router.post("/add", taskController_1.addTask);
exports.default = router;
