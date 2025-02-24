"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const { createClient } = require('redis');
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const redisClient = createClient({
    url: `redis://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
    username: process.env.REDIS_USERNAME,
});
redisClient.connect()
    .then(() => {
    console.log('Connected to Redis successfully');
})
    .catch((err) => {
    console.error('Redis connection error: ', err.message);
});
redisClient.on('error', (err) => {
    console.log('Redis error: ', err.message);
});
module.exports = redisClient;
//# sourceMappingURL=redis.js.map