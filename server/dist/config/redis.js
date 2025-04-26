"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const appConfig_1 = __importDefault(require("./appConfig"));
const redisClient = (0, redis_1.createClient)({
    url: `redis://:${appConfig_1.default.redis.password}@${appConfig_1.default.redis.host}:${appConfig_1.default.redis.port}`,
    username: appConfig_1.default.redis.username,
});
redisClient
    .connect()
    .then(() => {
    console.log("Connected to Redis successfully");
})
    .catch((err) => {
    console.error("Redis connection error: ", err.message);
});
redisClient.on("error", (err) => {
    console.log("Redis error: ", err.message);
});
exports.default = redisClient;
//# sourceMappingURL=redis.js.map