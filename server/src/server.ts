import express, { Request, Response } from "express";
import { createServer } from "http";
import cors from "cors";
import connectDB from "./config/dbConnection";
import taskRoutes from "./routes/taskRoutes";
import configureSocketIO from "./config/socketio";
import config from "./config/appConfig";

const app = express();
const httpServer = createServer(app);

const corsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) {
    if (!origin || config.server.allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};

// Initialize Socket.IO
configureSocketIO(httpServer);

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/tasks", taskRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Server is up and running!");
});

// Start server
const PORT = config.server.port;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
