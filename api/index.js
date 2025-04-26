// Import required libraries
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { createClient } = require("redis");

// Create express app
const app = express();
const httpServer = createServer(app);

// Initialize Redis client
const redisClient = createClient({
  url: `redis://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  username: process.env.REDIS_USERNAME || "default",
});

// Connect to Redis
redisClient.connect().catch((err) => {
  console.error("Redis connection error: ", err.message);
});

// Set up CORS
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:5000",
      "https://fullstack-task-hisamuddin-1.onrender.com",
      "https://fullstack-task-hisamuddin.vercel.app",
    ];
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(
    process.env.MONGO_URI ||
      "mongodb+srv://assignment_user:HCgEj5zv8Hxwa4xO@test-cluster.6f94f5o.mongodb.net/",
    {
      dbName: process.env.MONGO_DB_NAME || "Kazam",
    }
  )
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define Task model
const TaskSchema = new mongoose.Schema({
  tasks: { type: [String], required: true },
});

const Task = mongoose.model("assignment_hisamuddin", TaskSchema);

// Tasks array for Redis
let tasks = [];

// Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: corsOptions.origin,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("A user connected.");

  socket.on("add", async (newTask) => {
    try {
      if (!newTask || typeof newTask !== "string" || !newTask.trim()) {
        socket.emit("error", "Task cannot be empty");
        return;
      }

      tasks.push(newTask);

      await redisClient.set("FULLSTACK_TASK_HISAMUDDIN", JSON.stringify(tasks));

      if (tasks.length > 50) {
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
            `Tasks array length exceeded 50. Clearing tasks array and Redis cache.`
          );
          await redisClient.del("FULLSTACK_TASK_HISAMUDDIN");
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

// API Routes
app.get("/api/tasks/fetchAllTasks", async (req, res) => {
  try {
    const redisTasks = await redisClient.get("FULLSTACK_TASK_HISAMUDDIN");
    const tasksFromRedis = redisTasks ? JSON.parse(redisTasks) : [];

    const tasksFromMongoDB = await Task.find({});
    const tasksFromMongoDBArray =
      tasksFromMongoDB.length > 0
        ? tasksFromMongoDB.flatMap((task) => task.tasks)
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
});

// Health check route
app.get("/api", (req, res) => {
  res.json({ message: "API is running" });
});

// Export the Express API
module.exports = httpServer;
