const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const connectDatabase = require("./config/mongoose");
const redisClient = require("./config/redis");
const taskRoutes = require("./routes/taskRoutes");
const { Task } = require("./models/taskModel");
import { Request, Response } from "express";
const cors = require("cors");


const app = express();
const httpServer = createServer(app);

const allowedDomains = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5000",  
  "https://fullstack-task-hisamuddin-1.onrender.com",
];

const corsOptions = {
  origin: (origin: string, callback: any) => {
    if (!origin || allowedDomains.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true, 
};

const io = new Server(httpServer, {
  cors: {
    origin: allowedDomains,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(cors(corsOptions));
app.use(express.json());
connectDatabase();

let tasks: string[] = [];


io.on("connection", (socket: any) => {
  console.log("A user connected.");

  socket.on("add", async (newTask: string) => {
    console.log("New task:", newTask);
    try {
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
            "Tasks array length exceeded 3. Clearing tasks array and Redis cache."
          );
          await redisClient.del("FULLSTACK_TASK_HISAMUDDIN");
        }
      }

      const updatedTasksFromDB = await Task.findOne({});

      // io.emit("taskAdded", tasks);

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



app.use("/api/tasks", taskRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Server is up and running!");
});

const PORT = process.env.PORT || 8000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
