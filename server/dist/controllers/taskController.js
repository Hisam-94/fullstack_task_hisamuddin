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
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchAllTasks = void 0;
const redisClient = require('../config/redis');
const taskModel_1 = require("../models/taskModel");
const fetchAllTasks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const redisTasks = yield redisClient.get('FULLSTACK_TASK_HISAMUDDIN');
        const tasksFromRedis = redisTasks ? JSON.parse(redisTasks) : [];
        const tasksFromMongoDB = yield taskModel_1.Task.find({});
        const tasksFromMongoDBArray = tasksFromMongoDB.length > 0 ? tasksFromMongoDB.flatMap(tasks => tasks.tasks) : [];
        console.log("tasksFromMongoDBArray:", tasksFromMongoDBArray);
        console.log("tasksFromRedis:", tasksFromRedis);
        console.log("tasksFromRedis.length:", tasksFromRedis.length);
        // const allTasks = [...tasksFromRedis, ...tasksFromMongoDBArray];
        // res.json(allTasks.length > 0 ? allTasks : []);
        res.json({
            unsavedTasks: tasksFromRedis,
            mongoDBTasks: tasksFromMongoDBArray ? tasksFromMongoDBArray : [],
        });
    }
    catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ msg: 'Server error' });
    }
});
exports.fetchAllTasks = fetchAllTasks;
//# sourceMappingURL=taskController.js.map