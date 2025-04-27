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
const mongoose_1 = __importDefault(require("mongoose"));
const appConfig_1 = __importDefault(require("./appConfig"));
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Connecting to MongoDB...");
        console.log(`MongoDB URI: ${appConfig_1.default.mongodb.uri.substring(0, 20)}...`);
        console.log(`DB Name: ${appConfig_1.default.mongodb.dbName}`);
        // Set up MongoDB connection options with shorter timeouts for serverless environment
        const options = {
            dbName: appConfig_1.default.mongodb.dbName,
            connectTimeoutMS: 10000, // 10 seconds
            socketTimeoutMS: 45000, // 45 seconds
            serverSelectionTimeoutMS: 10000, // 10 seconds
            heartbeatFrequencyMS: 30000, // 30 seconds
        };
        yield mongoose_1.default.connect(appConfig_1.default.mongodb.uri, options);
        console.log("MongoDB Connected");
        // Handle connection events
        mongoose_1.default.connection.on("error", (err) => {
            console.error("MongoDB connection error:", err);
        });
        mongoose_1.default.connection.on("disconnected", () => {
            console.log("MongoDB disconnected");
        });
        // Gracefully handle process termination
        process.on("SIGINT", () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                yield mongoose_1.default.connection.close();
                console.log("MongoDB connection closed due to app termination");
                process.exit(0);
            }
            catch (err) {
                console.error("Error closing MongoDB connection:", err);
                process.exit(1);
            }
        }));
    }
    catch (err) {
        console.error("MongoDB connection error:", err);
        // In production, don't exit the process, just log the error
        if (process.env.NODE_ENV !== "production") {
            // Only exit in development for immediate feedback
            process.exit(1);
        }
    }
});
exports.default = connectDB;
