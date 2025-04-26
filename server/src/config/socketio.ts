import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { Task } from "../models/taskModel";
import redisClient from "./redis";
import config from "./appConfig";

export let tasks: string[] = [];

export const configureSocketIO = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: config.server.allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected.");

    socket.on("add", async (newTask: string) => {
      try {
        if (!newTask || typeof newTask !== "string" || !newTask.trim()) {
          socket.emit("error", "Task cannot be empty");
          return;
        }

        tasks.push(newTask);

        await redisClient.set(config.redis.storageKey, JSON.stringify(tasks));

        if (tasks.length > config.redis.taskLimit) {
          let taskDocument = await Task.findOne();

          if (!taskDocument) {
            await Task.create({ tasks });
            tasks = [];
          } else {
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
      console.log("User disconnected.");
    });
  });

  return io;
};

export default configureSocketIO;
