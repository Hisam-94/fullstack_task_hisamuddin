"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchAllTasks = void 0;
const redis_1 = __importDefault(require("../config/redis"));
const taskModel_1 = require("../models/taskModel");
const appConfig_1 = __importDefault(require("../config/appConfig"));
const fetchAllTasks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const redisTasks = yield redis_1.default.get(appConfig_1.default.redis.storageKey);
        const tasksFromRedis = redisTasks ? JSON.parse(redisTasks) : [];
        const tasksFromMongoDB = yield taskModel_1.Task.find({});
        const tasksFromMongoDBArray = tasksFromMongoDB.length > 0
            ? tasksFromMongoDB.flatMap((tasks) => tasks.tasks)
            : [];
        // Log only during development
        if (process.env.NODE_ENV !== "production") {
            console.log("tasksFromMongoDBArray:", tasksFromMongoDBArray);
            console.log("tasksFromRedis:", tasksFromRedis);
            console.log("tasksFromRedis.length:", tasksFromRedis.length);
        }
        res.json({
            unsavedTasks: tasksFromRedis,
            mongoDBTasks: tasksFromMongoDBArray ? tasksFromMongoDBArray : [],
        });
    }
    catch (error) {
        console.error("Error fetching tasks:", error);
        res
            .status(500)
            .json({ error: "Server error", message: "Failed to retrieve tasks" });
    }
});
exports.fetchAllTasks = fetchAllTasks;
//# sourceMappingURL=taskController.js.map