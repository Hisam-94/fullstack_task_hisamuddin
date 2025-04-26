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
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: appConfig_1.default.server.allowedOrigins,
            methods: ["GET", "POST"],
            credentials: true,
        },
    });
    io.on("connection", (socket) => {
        console.log("A user connected.");
        socket.on("add", (newTask) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                if (!newTask || typeof newTask !== "string" || !newTask.trim()) {
                    socket.emit("error", "Task cannot be empty");
                    return;
                }
                exports.tasks.push(newTask);
                yield redis_1.default.set(appConfig_1.default.redis.storageKey, JSON.stringify(exports.tasks));
                if (exports.tasks.length > appConfig_1.default.redis.taskLimit) {
                    let taskDocument = yield taskModel_1.Task.findOne();
                    if (!taskDocument) {
                        yield taskModel_1.Task.create({ tasks: exports.tasks });
                        exports.tasks = [];
                    }
                    else {
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
            console.log("User disconnected.");
        });
    });
    return io;
};
exports.configureSocketIO = configureSocketIO;
exports.default = exports.configureSocketIO;
//# sourceMappingURL=socketio.js.map