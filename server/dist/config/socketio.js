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
exports.configureSocketIO = exports.tasks = void 0;
const socket_io_1 = require("socket.io");
const taskModel_1 = require("../models/taskModel");
const redis_1 = __importDefault(require("./redis"));
const appConfig_1 = __importDefault(require("./appConfig"));
exports.tasks = [];
const configureSocketIO = (httpServer) => {
    try {
        console.log("Setting up Socket.IO...");
        console.log("Allowed origins:", appConfig_1.default.server.allowedOrigins);
        const io = new socket_io_1.Server(httpServer, {
            cors: {
                origin: (origin, callback) => {
                    // Allow requests with no origin (like mobile apps, curl, Postman)
                    if (!origin)
                        return callback(null, true);
                    // Check if the origin is allowed
                    if (appConfig_1.default.server.allowedOrigins.indexOf(origin) !== -1) {
                        console.log(`Socket.IO: Allowing origin: ${origin}`);
                        return callback(null, true);
                    }
                    console.error(`Socket.IO: Origin not allowed: ${origin}`);
                    return callback(new Error(`Origin ${origin} not allowed by CORS`), false);
                },
                methods: ["GET", "POST"],
                credentials: true,
                allowedHeaders: ["Content-Type", "Authorization"],
            },
            transports: ["websocket", "polling"], // Prioritize WebSockets
            allowEIO3: true, // Allow Engine.IO 3 requests (for compatibility)
            path: "/socket.io/",
            connectTimeout: 45000, // 45s timeout
            pingTimeout: 30000, // How long to wait for pong (30s)
            pingInterval: 25000, // How often to ping (25s)
        });
        io.on("connection", (socket) => {
            console.log(`Socket connected: ${socket.id}`);
            socket.on("add", (newTask) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    if (!newTask || typeof newTask !== "string" || !newTask.trim()) {
                        console.log("Socket: Empty task received");
                        socket.emit("error", "Task cannot be empty");
                        return;
                    }
                    console.log(`Socket: Adding task: ${newTask.substring(0, 20)}${newTask.length > 20 ? "..." : ""}`);
                    exports.tasks.push(newTask);
                    yield redis_1.default.set(appConfig_1.default.redis.storageKey, JSON.stringify(exports.tasks));
                    if (exports.tasks.length > appConfig_1.default.redis.taskLimit) {
                        let taskDocument = yield taskModel_1.Task.findOne();
                        if (!taskDocument) {
                            console.log("Socket: Creating new task document in MongoDB");
                            yield taskModel_1.Task.create({ tasks: exports.tasks });
                            exports.tasks = [];
                        }
                        else {
                            console.log("Socket: Updating existing task document in MongoDB");
                            yield taskModel_1.Task.updateOne({ _id: taskDocument._id }, {
                                $push: {
                                    tasks: { $each: exports.tasks },
                                },
                            });
                            exports.tasks = [];
                            console.log(`Tasks array length exceeded ${appConfig_1.default.redis.taskLimit}. Clearing tasks array and Redis cache.`);
                            yield redis_1.default.del(appConfig_1.default.redis.storageKey);
                        }
                    }
                    const updatedTasksFromDB = yield taskModel_1.Task.findOne({});
                    io.emit("taskAdded", {
                        unsavedTasks: exports.tasks,
                        mongoDBTasks: updatedTasksFromDB ? updatedTasksFromDB.tasks : [],
                    });
                }
                catch (error) {
                    console.error("Error processing task addition:", error);
                    socket.emit("error", "Failed to add task. Please try again.");
                }
            }));
            socket.on("disconnect", () => {
                console.log(`Socket disconnected: ${socket.id}`);
            });
            socket.on("error", (error) => {
                console.error(`Socket error for ${socket.id}:`, error);
            });
        });
        io.engine.on("connection_error", (err) => {
            console.error("Socket.IO connection error:", err);
        });
        console.log("Socket.IO configuration complete");
        return io;
    }
    catch (error) {
        console.error("Error configuring Socket.IO:", error);
        // Return a mock IO object to prevent app crashes
        return {
            on: () => { },
            emit: () => { },
        };
    }
};
exports.configureSocketIO = configureSocketIO;
exports.default = exports.configureSocketIO;
