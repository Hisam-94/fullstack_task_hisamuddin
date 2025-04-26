import { Request, Response } from "express";
import redisClient from "../config/redis";
import { Task, ITask } from "../models/taskModel";
import config from "../config/appConfig";
import { tasks } from "../config/socketio";

export const fetchAllTasks = async (req: Request, res: Response) => {
  try {
    console.log("fetchAllTasks: Starting to fetch tasks");

    // Check Redis connection
    if (!redisClient.isOpen) {
      console.log("Redis client is not connected, attempting to connect...");
      try {
        await redisClient.connect();
      } catch (redisConnectError) {
        console.error("Failed to connect to Redis:", redisConnectError);
      }
    }

    console.log("fetchAllTasks: Fetching tasks from Redis");
    let tasksFromRedis: string[] = [];
    try {
      const redisTasks = await redisClient.get(config.redis.storageKey);
      tasksFromRedis = redisTasks ? JSON.parse(redisTasks) : [];
      console.log("fetchAllTasks: Successfully fetched tasks from Redis");
    } catch (redisError) {
      console.error("Error fetching from Redis:", redisError);
      // Continue execution even if Redis fails
    }

    console.log("fetchAllTasks: Fetching tasks from MongoDB");
    let tasksFromMongoDBArray: string[] = [];
    try {
      const tasksFromMongoDB = await Task.find({});
      if (tasksFromMongoDB && tasksFromMongoDB.length > 0) {
        // Explicitly handle the MongoDB array types
        tasksFromMongoDBArray = tasksFromMongoDB.reduce(
          (acc: string[], doc: ITask) => {
            if (doc.tasks && Array.isArray(doc.tasks)) {
              return [...acc, ...doc.tasks];
            }
            return acc;
          },
          []
        );
      }
      console.log("fetchAllTasks: Successfully fetched tasks from MongoDB");
    } catch (mongoError) {
      console.error("Error fetching from MongoDB:", mongoError);
      // Continue execution even if MongoDB fails
    }

    // Log only during development
    if (process.env.NODE_ENV !== "production") {
      console.log("tasksFromMongoDBArray:", tasksFromMongoDBArray);
      console.log("tasksFromRedis:", tasksFromRedis);
      console.log("tasksFromRedis.length:", tasksFromRedis.length);
    }

    console.log("fetchAllTasks: Sending response");
    res.json({
      unsavedTasks: tasksFromRedis,
      mongoDBTasks: tasksFromMongoDBArray,
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    // Include error details in the response for debugging
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    res.status(500).json({
      error: "Server error",
      message: "Failed to retrieve tasks",
      details: errorMessage,
      stack: process.env.NODE_ENV !== "production" ? errorStack : undefined,
    });
  }
};

export const addTask = async (req: Request, res: Response) => {
  try {
    console.log("addTask: Starting to add task");
    const { task } = req.body;

    if (!task || typeof task !== "string" || !task.trim()) {
      console.log("addTask: Empty task received");
      return res.status(400).json({ error: "Task cannot be empty" });
    }

    console.log(
      `addTask: Adding task: ${task.substring(0, 20)}${
        task.length > 20 ? "..." : ""
      }`
    );

    // Add task to the array
    tasks.push(task);

    // Save to Redis
    try {
      if (!redisClient.isOpen) {
        await redisClient.connect();
      }
      await redisClient.set(config.redis.storageKey, JSON.stringify(tasks));
      console.log("addTask: Task saved to Redis");
    } catch (redisError) {
      console.error("Error saving to Redis:", redisError);
      // Continue execution even if Redis fails
    }

    // Check if tasks need to be moved to MongoDB
    if (tasks.length > config.redis.taskLimit) {
      console.log(
        `addTask: Tasks length (${tasks.length}) exceeded limit (${config.redis.taskLimit})`
      );

      try {
        let taskDocument = await Task.findOne();

        if (!taskDocument) {
          console.log("addTask: Creating new task document in MongoDB");
          await Task.create({ tasks });
          tasks.length = 0; // Clear the array
        } else {
          console.log("addTask: Updating existing task document in MongoDB");
          await Task.updateOne(
            { _id: taskDocument._id },
            { $push: { tasks: { $each: tasks } } }
          );
          tasks.length = 0; // Clear the array

          console.log("addTask: Clearing Redis cache");
          await redisClient.del(config.redis.storageKey);
        }
      } catch (mongoError) {
        console.error("Error saving to MongoDB:", mongoError);
        // Don't clear tasks array if MongoDB fails
      }
    }

    let mongoDBTasks: string[] = [];
    try {
      const updatedTasksFromDB = await Task.findOne({});
      if (updatedTasksFromDB && updatedTasksFromDB.tasks) {
        mongoDBTasks = updatedTasksFromDB.tasks;
      }
    } catch (mongoError) {
      console.error("Error fetching from MongoDB after add:", mongoError);
    }

    console.log("addTask: Sending response");
    res.json({
      success: true,
      unsavedTasks: tasks,
      mongoDBTasks: mongoDBTasks,
    });
  } catch (error) {
    console.error("Error adding task:", error);
    // Include error details in the response for debugging
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    res.status(500).json({
      error: "Server error",
      message: "Failed to add task",
      details: errorMessage,
      stack: process.env.NODE_ENV !== "production" ? errorStack : undefined,
    });
  }
};
