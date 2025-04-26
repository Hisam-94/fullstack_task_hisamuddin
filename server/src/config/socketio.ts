import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { Task } from "../models/taskModel";
import redisClient from "./redis";
import config from "./appConfig";

export let tasks: string[] = [];

export const configureSocketIO = (httpServer: HttpServer) => {
  try {
    console.log("Setting up Socket.IO...");
    console.log("Allowed origins:", config.server.allowedOrigins);

    const io = new Server(httpServer, {
      cors: {
        origin: (origin, callback) => {
          // Allow requests with no origin (like mobile apps, curl, Postman)
          if (!origin) return callback(null, true);

          // Check if the origin is allowed
          if (config.server.allowedOrigins.indexOf(origin) !== -1) {
            console.log(`Socket.IO: Allowing origin: ${origin}`);
            return callback(null, true);
          }

          console.error(`Socket.IO: Origin not allowed: ${origin}`);
          return callback(
            new Error(`Origin ${origin} not allowed by CORS`),
            false
          );
        },
        methods: ["GET", "POST"],
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization"],
      },
      transports: ["websocket", "polling"],
      allowEIO3: true, // Allow Engine.IO 3 requests (for compatibility)
      path: "/socket.io/",
      connectTimeout: 45000, // 45s timeout
    });

    io.on("connection", (socket) => {
      console.log(`Socket connected: ${socket.id}`);

      socket.on("add", async (newTask: string) => {
        try {
          if (!newTask || typeof newTask !== "string" || !newTask.trim()) {
            console.log("Socket: Empty task received");
            socket.emit("error", "Task cannot be empty");
            return;
          }

          console.log(
            `Socket: Adding task: ${newTask.substring(0, 20)}${
              newTask.length > 20 ? "..." : ""
            }`
          );
          tasks.push(newTask);

          await redisClient.set(config.redis.storageKey, JSON.stringify(tasks));

          if (tasks.length > config.redis.taskLimit) {
            let taskDocument = await Task.findOne();

            if (!taskDocument) {
              console.log("Socket: Creating new task document in MongoDB");
              await Task.create({ tasks });
              tasks = [];
            } else {
              console.log("Socket: Updating existing task document in MongoDB");
              await Task.updateOne(
                { _id: taskDocument._id },
                {
                  $push: {
                    tasks: { $each: tasks },
                  },
                }
              );
              tasks = [];

              console.log(
                `Tasks array length exceeded ${config.redis.taskLimit}. Clearing tasks array and Redis cache.`
              );
              await redisClient.del(config.redis.storageKey);
            }
          }

          const updatedTasksFromDB = await Task.findOne({});

          io.emit("taskAdded", {
            unsavedTasks: tasks,
            mongoDBTasks: updatedTasksFromDB ? updatedTasksFromDB.tasks : [],
          });
        } catch (error) {
          console.error("Error processing task addition:", error);
          socket.emit("error", "Failed to add task. Please try again.");
        }
      });

      socket.on("disconnect", () => {
        console.log(`Socket disconnected: ${socket.id}`);
      });

      socket.on("error", (error) => {
        console.error(`Socket error for ${socket.id}:`, error);
      });
    });

    io.engine.on("connection_error", (err) => {
      console.error("Socket.IO connection error:", err);
    });

    console.log("Socket.IO configuration complete");
    return io;
  } catch (error) {
    console.error("Error configuring Socket.IO:", error);
    // Return a mock IO object to prevent app crashes
    return {
      on: () => {},
      emit: () => {},
    } as any;
  }
};

export default configureSocketIO;
