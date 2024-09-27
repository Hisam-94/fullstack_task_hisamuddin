// import { createClient } from "redis";
// import dotenv from "dotenv";

// dotenv.config();

// // Create the Redis client using the connection URL format
// const redisClient = createClient({
//   url: `redis://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
//   // You can also include `username` if Redis configuration requires it
//   username: process.env.REDIS_USERNAME, // Include if required, or remove if not necessary
// });

// // Properly connect to Redis and handle errors
// redisClient.connect().catch((err: Error) => {
//   console.error("Redis connection error: ", err.message);
// });

// // Handle Redis client errors
// redisClient.on("error", (err: Error) => {
//   console.log("Redis error: ", err.message);
// });

// module.exports = redisClient;

// redis.js or redis.ts (your Redis configuration file)
// import { createClient } from 'redis';
const {createClient} = require('redis');
import { RedisClientType } from 'redis';


import dotenv from 'dotenv';

dotenv.config();

const redisClient: RedisClientType = createClient({
  url: `redis://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  username: process.env.REDIS_USERNAME, // Include only if necessary
});

redisClient.connect()
  .then(() => {
    console.log('Connected to Redis successfully');
  })
  .catch((err: Error) => {
    console.error('Redis connection error: ', err.message);
  });

// Handle Redis client errors
redisClient.on('error', (err: Error) => {
  console.log('Redis error: ', err.message);
});

module.exports = redisClient;
