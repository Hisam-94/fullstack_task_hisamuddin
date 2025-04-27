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
const redis_1 = require("redis");
const appConfig_1 = __importDefault(require("./appConfig"));
// Check if Redis credentials are available
const hasRedisCredentials = !!(appConfig_1.default.redis.host &&
    appConfig_1.default.redis.port &&
    appConfig_1.default.redis.password);
console.log("Redis connection details:", {
    host: appConfig_1.default.redis.host
        ? `${appConfig_1.default.redis.host.substring(0, 5)}...`
        : "missing",
    port: appConfig_1.default.redis.port || "missing",
    username: appConfig_1.default.redis.username || "default",
    password: appConfig_1.default.redis.password ? "provided" : "missing",
    hasCredentials: hasRedisCredentials,
});
let redisClient;
try {
    // Create Redis client
    redisClient = (0, redis_1.createClient)({
        url: `redis://:${appConfig_1.default.redis.password}@${appConfig_1.default.redis.host}:${appConfig_1.default.redis.port}`,
        username: appConfig_1.default.redis.username,
        socket: {
            reconnectStrategy: (retries) => {
                console.log(`Redis reconnect attempt: ${retries}`);
                // Reconnect with exponential backoff, but max 10 seconds
                return Math.min(retries * 500, 10000);
            },
        },
    });
    // Set up event handlers
    redisClient.on("connect", () => {
        console.log("Redis: Connection established");
    });
    redisClient.on("ready", () => {
        console.log("Redis: Client is ready");
    });
    redisClient.on("error", (err) => {
        console.error("Redis error:", err.message);
    });
    redisClient.on("reconnecting", () => {
        console.log("Redis: Reconnecting...");
    });
    redisClient.on("end", () => {
        console.log("Redis: Connection ended");
    });
    // Initial connection
    if (hasRedisCredentials) {
        redisClient.connect().catch((err) => {
            console.error("Redis initial connection error:", err.message);
        });
    }
    else {
        console.warn("Redis credentials missing. Skipping initial connection.");
    }
}
catch (error) {
    console.error("Error initializing Redis client:", error);
    // Create a mock Redis client if we can't initialize a real one
    // @ts-ignore - This is a fallback for when Redis can't be initialized
    redisClient = {
        isOpen: false,
        connect: () => __awaiter(void 0, void 0, void 0, function* () {
            console.warn("Mock Redis client - connect() called");
            return Promise.resolve();
        }),
        get: () => __awaiter(void 0, void 0, void 0, function* () {
            console.warn("Mock Redis client - get() called");
            return Promise.resolve(null);
        }),
        set: () => __awaiter(void 0, void 0, void 0, function* () {
            console.warn("Mock Redis client - set() called");
            return Promise.resolve(null);
        }),
        del: () => __awaiter(void 0, void 0, void 0, function* () {
            console.warn("Mock Redis client - del() called");
            return Promise.resolve(null);
        }),
        on: () => {
            return redisClient;
        },
    };
}
exports.default = redisClient;
