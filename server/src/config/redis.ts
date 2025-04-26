import { createClient, RedisClientType } from "redis";
import config from "./appConfig";

const redisClient: RedisClientType = createClient({
  url: `redis://:${config.redis.password}@${config.redis.host}:${config.redis.port}`,
  username: config.redis.username,
});

redisClient
  .connect()
  .then(() => {
    console.log("Connected to Redis successfully");
  })
  .catch((err: Error) => {
    console.error("Redis connection error: ", err.message);
  });

redisClient.on("error", (err: Error) => {
  console.log("Redis error: ", err.message);
});

export default redisClient;
