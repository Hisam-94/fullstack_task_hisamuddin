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
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const connectDatabase = require("./config/mongoose");
const redisClient = require("./config/redis");
const taskRoutes = require("./routes/taskRoutes");
const { Task } = require("./models/taskModel");
const cors = require("cors");
const app = express();
const httpServer = createServer(app);
const allowedDomains = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5000",
];
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedDomains.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
};
const io = new Server(httpServer, {
    cors: {
        origin: allowedDomains,
        methods: ["GET", "POST"],
        credentials: true,
    },
});
app.use(cors(corsOptions));
app.use(express.json());
connectDatabase();
let tasks = [];
io.on("connection", (socket) => {
    console.log("A user connected.");
    socket.on("add", (newTask) => __awaiter(void 0, void 0, void 0, function* () {
        console.log("New task:", newTask);
        try {
            tasks.push(newTask);
            yield redisClient.set("FULLSTACK_TASK_HISAMUDDIN", JSON.stringify(tasks));
            if (tasks.length > 50) {
                let taskDocument = yield Task.findOne();
                if (!taskDocument) {
                    yield Task.create({ tasks });
                    tasks = [];
                }
                else {
                    yield Task.updateOne({ _id: taskDocument._id }, {
                        $push: {
                            tasks: { $each: tasks },
                        },
                    });
                    tasks = [];
                    console.log("Tasks array length exceeded 3. Clearing tasks array and Redis cache.");
                    yield redisClient.del("FULLSTACK_TASK_HISAMUDDIN");
                }
            }
            const updatedTasksFromDB = yield Task.findOne({});
            // io.emit("taskAdded", tasks);
            io.emit("taskAdded", {
                unsavedTasks: tasks,
                mongoDBTasks: updatedTasksFromDB ? updatedTasksFromDB.tasks : [],
            });
        }
        catch (error) {
            console.error("Error processing task addition:", error);
        }
    }));
    socket.on("disconnect", () => {
        console.log("User disconnected.");
    });
});
app.use("/api/tasks", taskRoutes);
app.get("/", (req, res) => {
    res.send("Server is up and running!");
});
const PORT = process.env.PORT || 8000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
//# sourceMappingURL=server.js.map