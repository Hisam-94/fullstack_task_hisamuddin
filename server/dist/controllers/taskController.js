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
exports.addTask = exports.fetchAllTasks = void 0;
const redis_1 = __importDefault(require("../config/redis"));
const taskModel_1 = require("../models/taskModel");
const appConfig_1 = __importDefault(require("../config/appConfig"));
const socketio_1 = require("../config/socketio");
const fetchAllTasks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("fetchAllTasks: Starting to fetch tasks");
        // Check Redis connection
        if (!redis_1.default.isOpen) {
            console.log("Redis client is not connected, attempting to connect...");
            try {
                yield redis_1.default.connect();
            }
            catch (redisConnectError) {
                console.error("Failed to connect to Redis:", redisConnectError);
            }
        }
        console.log("fetchAllTasks: Fetching tasks from Redis");
        let tasksFromRedis = [];
        try {
            const redisTasks = yield redis_1.default.get(appConfig_1.default.redis.storageKey);
            tasksFromRedis = redisTasks ? JSON.parse(redisTasks) : [];
            console.log("fetchAllTasks: Successfully fetched tasks from Redis");
        }
        catch (redisError) {
            console.error("Error fetching from Redis:", redisError);
            // Continue execution even if Redis fails
        }
        console.log("fetchAllTasks: Fetching tasks from MongoDB");
        let tasksFromMongoDBArray = [];
        try {
            const tasksFromMongoDB = yield taskModel_1.Task.find({});
            if (tasksFromMongoDB && tasksFromMongoDB.length > 0) {
                // Explicitly handle the MongoDB array types
                tasksFromMongoDBArray = tasksFromMongoDB.reduce((acc, doc) => {
                    if (doc.tasks && Array.isArray(doc.tasks)) {
                        return [...acc, ...doc.tasks];
                    }
                    return acc;
                }, []);
            }
            console.log("fetchAllTasks: Successfully fetched tasks from MongoDB");
        }
        catch (mongoError) {
            console.error("Error fetching from MongoDB:", mongoError);
            // Continue execution even if MongoDB fails
        }
        // Log only during development
        if (process.env.NODE_ENV !== "production") {
            console.log("tasksFromMongoDBArray:", tasksFromMongoDBArray);
            console.log("tasksFromRedis:", tasksFromRedis);
            console.log("tasksFromRedis.length:", tasksFromRedis.length);
        }
        console.log("fetchAllTasks: Sending response");
        res.json({
            unsavedTasks: tasksFromRedis,
            mongoDBTasks: tasksFromMongoDBArray,
        });
    }
    catch (error) {
        console.error("Error fetching tasks:", error);
        // Include error details in the response for debugging
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;
        res.status(500).json({
            error: "Server error",
            message: "Failed to retrieve tasks",
            details: errorMessage,
            stack: process.env.NODE_ENV !== "production" ? errorStack : undefined,
        });
    }
});
exports.fetchAllTasks = fetchAllTasks;
const addTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("addTask: Starting to add task");
        const { task } = req.body;
        if (!task || typeof task !== "string" || !task.trim()) {
            console.log("addTask: Empty task received");
            return res.status(400).json({ error: "Task cannot be empty" });
        }
        console.log(`addTask: Adding task: ${task.substring(0, 20)}${task.length > 20 ? "..." : ""}`);
        // Add task to the array
        socketio_1.tasks.push(task);
        // Save to Redis
        try {
            if (!redis_1.default.isOpen) {
                yield redis_1.default.connect();
            }
            yield redis_1.default.set(appConfig_1.default.redis.storageKey, JSON.stringify(socketio_1.tasks));
            console.log("addTask: Task saved to Redis");
        }
        catch (redisError) {
            console.error("Error saving to Redis:", redisError);
            // Continue execution even if Redis fails
        }
        // Check if tasks need to be moved to MongoDB
        if (socketio_1.tasks.length > appConfig_1.default.redis.taskLimit) {
            console.log(`addTask: Tasks length (${socketio_1.tasks.length}) exceeded limit (${appConfig_1.default.redis.taskLimit})`);
            try {
                let taskDocument = yield taskModel_1.Task.findOne();
                if (!taskDocument) {
                    console.log("addTask: Creating new task document in MongoDB");
                    yield taskModel_1.Task.create({ tasks: socketio_1.tasks });
                    socketio_1.tasks.length = 0; // Clear the array
                }
                else {
                    console.log("addTask: Updating existing task document in MongoDB");
                    yield taskModel_1.Task.updateOne({ _id: taskDocument._id }, { $push: { tasks: { $each: socketio_1.tasks } } });
                    socketio_1.tasks.length = 0; // Clear the array
                    console.log("addTask: Clearing Redis cache");
                    yield redis_1.default.del(appConfig_1.default.redis.storageKey);
                }
            }
            catch (mongoError) {
                console.error("Error saving to MongoDB:", mongoError);
                // Don't clear tasks array if MongoDB fails
            }
        }
        let mongoDBTasks = [];
        try {
            const updatedTasksFromDB = yield taskModel_1.Task.findOne({});
            if (updatedTasksFromDB && updatedTasksFromDB.tasks) {
                mongoDBTasks = updatedTasksFromDB.tasks;
            }
        }
        catch (mongoError) {
            console.error("Error fetching from MongoDB after add:", mongoError);
        }
        console.log("addTask: Sending response");
        res.json({
            success: true,
            unsavedTasks: socketio_1.tasks,
            mongoDBTasks: mongoDBTasks,
        });
    }
    catch (error) {
        console.error("Error adding task:", error);
        // Include error details in the response for debugging
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;
        res.status(500).json({
            error: "Server error",
            message: "Failed to add task",
            details: errorMessage,
            stack: process.env.NODE_ENV !== "production" ? errorStack : undefined,
        });
    }
});
exports.addTask = addTask;
