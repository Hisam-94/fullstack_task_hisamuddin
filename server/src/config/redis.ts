const {createClient} = require('redis');
import { RedisClientType } from 'redis';


import dotenv from 'dotenv';

dotenv.config();

const redisClient: RedisClientType = createClient({
  url: `redis://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  username: process.env.REDIS_USERNAME,
});

redisClient.connect()
  .then(() => {
    console.log('Connected to Redis successfully');
  })
  .catch((err: Error) => {
    console.error('Redis connection error: ', err.message);
  });

redisClient.on('error', (err: Error) => {
  console.log('Redis error: ', err.message);
});

module.exports = redisClient;
