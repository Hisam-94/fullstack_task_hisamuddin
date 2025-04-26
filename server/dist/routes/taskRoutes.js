"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const taskController_1 = require("../controllers/taskController");
const router = (0, express_1.Router)();
router.get("/fetchAllTasks", taskController_1.fetchAllTasks);
exports.default = router;
//# sourceMappingURL=taskRoutes.js.map