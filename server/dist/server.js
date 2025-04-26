"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const cors_1 = __importDefault(require("cors"));
const dbConnection_1 = __importDefault(require("./config/dbConnection"));
const taskRoutes_1 = __importDefault(require("./routes/taskRoutes"));
const socketio_1 = __importDefault(require("./config/socketio"));
const appConfig_1 = __importDefault(require("./config/appConfig"));
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || appConfig_1.default.server.allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
};
// Initialize Socket.IO
(0, socketio_1.default)(httpServer);
// Middleware
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
// Connect to MongoDB
(0, dbConnection_1.default)();
// Routes
app.use("/api/tasks", taskRoutes_1.default);
app.get("/", (req, res) => {
    res.send("Server is up and running!");
});
// Start server
const PORT = appConfig_1.default.server.port;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
//# sourceMappingURL=server.js.map