import { createClient, RedisClientType } from "redis";
import config from "./appConfig";

// Check if Redis credentials are available
const hasRedisCredentials = !!(
  config.redis.host &&
  config.redis.port &&
  config.redis.password
);

console.log("Redis connection details:", {
  host: config.redis.host
    ? `${config.redis.host.substring(0, 5)}...`
    : "missing",
  port: config.redis.port || "missing",
  username: config.redis.username || "default",
  password: config.redis.password ? "provided" : "missing",
  hasCredentials: hasRedisCredentials,
});

let redisClient: RedisClientType;

try {
  // Create Redis client
  redisClient = createClient({
    url: `redis://:${config.redis.password}@${config.redis.host}:${config.redis.port}`,
    username: config.redis.username,
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
  } else {
    console.warn("Redis credentials missing. Skipping initial connection.");
  }
} catch (error) {
  console.error("Error initializing Redis client:", error);
  // Create a mock Redis client if we can't initialize a real one
  // @ts-ignore - This is a fallback for when Redis can't be initialized
  redisClient = {
    isOpen: false,
    connect: async () => {
      console.warn("Mock Redis client - connect() called");
      return Promise.resolve();
    },
    get: async () => {
      console.warn("Mock Redis client - get() called");
      return Promise.resolve(null);
    },
    set: async () => {
      console.warn("Mock Redis client - set() called");
      return Promise.resolve(null);
    },
    del: async () => {
      console.warn("Mock Redis client - del() called");
      return Promise.resolve(null);
    },
    on: () => {
      return redisClient;
    },
  } as unknown as RedisClientType;
}

export default redisClient;
