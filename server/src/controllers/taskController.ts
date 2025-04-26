import { Request, Response } from "express";
import redisClient from "../config/redis";
import { Task } from "../models/taskModel";
import config from "../config/appConfig";

export const fetchAllTasks = async (req: Request, res: Response) => {
  try {
    const redisTasks = await redisClient.get(config.redis.storageKey);
    const tasksFromRedis = redisTasks ? JSON.parse(redisTasks) : [];

    const tasksFromMongoDB = await Task.find({});
    const tasksFromMongoDBArray =
      tasksFromMongoDB.length > 0
        ? tasksFromMongoDB.flatMap((tasks) => tasks.tasks)
        : [];

    // Log only during development
    if (process.env.NODE_ENV !== "production") {
      console.log("tasksFromMongoDBArray:", tasksFromMongoDBArray);
      console.log("tasksFromRedis:", tasksFromRedis);
      console.log("tasksFromRedis.length:", tasksFromRedis.length);
    }

    res.json({
      unsavedTasks: tasksFromRedis,
      mongoDBTasks: tasksFromMongoDBArray ? tasksFromMongoDBArray : [],
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res
      .status(500)
      .json({ error: "Server error", message: "Failed to retrieve tasks" });
  }
};
