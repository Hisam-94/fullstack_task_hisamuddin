const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const connectDatabase = require("./config/mongoose");
const redisClient = require("./config/redis"); // Assuming this is properly set up
const taskRoutes = require("./routes/taskRoutes");
const { Task } = require("./models/taskModel");
import { Request, Response } from "express";
const cors = require("cors");


const app = express();
const httpServer = createServer(app);

// List of allowed domains
const allowedDomains = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5000",
  "http://example.com",    
  "http://anotherdomain.com" 
];

// Dynamic CORS setup
const corsOptions = {
  origin: (origin: string, callback: any) => {
    // Check if the request origin is in the allowed domains list
    if (!origin || allowedDomains.indexOf(origin) !== -1) {
      callback(null, true); // Allow the request
    } else {
      callback(new Error("Not allowed by CORS")); // Deny the request
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true, // Enable credentials (cookies, etc.)
};


// Enable CORS for Socket.IO and set allowed origins (e.g., frontend URL)
const io = new Server(httpServer, {
  cors: {
    origin: allowedDomains, // Frontend URL
    methods: ["GET", "POST"], // Allowed methods
    credentials: true, // Enable credentials if needed
  },
});

// Use CORS middleware for Express routes
app.use(cors(corsOptions));

// Express middleware to parse JSON
app.use(express.json());

// Connect DB
connectDatabase();

let tasks: string[] = [];


io.on("connection", (socket: any) => {
  console.log("A user connected.");

  socket.on("add", async (newTask: string) => {
    console.log("New task:", newTask);
    try {
      // Add the new task to the tasks array
      tasks.push(newTask);

      // Store tasks in Redis (await to handle async operation)
      await redisClient.set("FULLSTACK_TASK_HISAMUDDIN", JSON.stringify(tasks));

      // Clear the tasks array if more than 3 tasks (for demonstration)
      if (tasks.length > 3) {
        // Check if the task document exists in MongoDB
        let taskDocument = await Task.findOne();

        if (!taskDocument) {
          // If no task document exists, create a new one
          await Task.create({ tasks });
          tasks = [];
        } else {
          // If a document exists, update it with the new tasks by appending to the array
          await Task.updateOne(
            { _id: taskDocument._id },
            {
              $push: {
                tasks: { $each: tasks }, // Append new tasks to the existing array
              },
            }
          );
          tasks = []; // Clear local tasks array after update

          console.log(
            "Tasks array length exceeded 3. Clearing tasks array and Redis cache."
          );

          // Clear Redis cache
          await redisClient.del("FULLSTACK_TASK_HISAMUDDIN");
        }
      }

      // Fetch updated tasks from MongoDB to include in the emitted message
      const updatedTasksFromDB = await Task.findOne({});

      // // Emit updated task list to all connected clients
      // io.emit("taskAdded", tasks);

      // Emit updated task list to all connected clients with both local and MongoDB tasks
      io.emit("taskAdded", {
        unsavedTasks: tasks,
        mongoDBTasks: updatedTasksFromDB ? updatedTasksFromDB.tasks : [],
      });
    } catch (error) {
      console.error("Error processing task addition:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected.");
  });
});



// Routes for tasks API
app.use("/api/tasks", taskRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Server is up and running!");
});

// Start the server
const PORT = process.env.PORT || 8000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
