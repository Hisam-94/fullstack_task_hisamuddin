"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
const config = {
    server: {
        port: process.env.PORT || 8000,
        allowedOrigins: [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:5000",
            "https://fullstack-task-hisamuddin.vercel.app",
            "https://fullstack-task-hisamuddin-client.vercel.app",
            "https://fullstack-task-hisamuddin-u53c.vercel.app",
        ],
    },
    mongodb: {
        uri: process.env.MONGO_URI || "",
        dbName: process.env.MONGO_DB_NAME || "Kazam",
    },
    redis: {
        host: process.env.REDIS_HOST || "",
        port: process.env.REDIS_PORT || "",
        username: process.env.REDIS_USERNAME || "",
        password: process.env.REDIS_PASSWORD || "",
        storageKey: "FULLSTACK_TASK_HISAMUDDIN",
        taskLimit: 50, // when to move tasks to MongoDB
    },
};
exports.default = config;
