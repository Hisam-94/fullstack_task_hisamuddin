import { io, Socket } from "socket.io-client";

// Use the API URL from environment variables
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

// Create socket instance with WebSocket only and limited reconnection
const socket: Socket = io(API_URL, {
  withCredentials: true,
  transports: ["websocket"], // WebSocket only
  reconnectionAttempts: 2, // Only try reconnecting twice
  reconnectionDelay: 1000,
  timeout: 10000,
  autoConnect: true,
});

// Connection status tracking
let hasLoggedConnectionIssue = false;

// Socket connection event handlers
socket.on("connect", () => {
  console.log("Connected to server successfully");
  hasLoggedConnectionIssue = false; // Reset flag when connected
});

socket.on("connect_error", (error) => {
  // Only log the first connection error to avoid console spam
  if (!hasLoggedConnectionIssue) {
    console.error("Connection error:", error);
    console.log(
      "If using Vercel, note that their free tier doesn't support WebSockets"
    );
    hasLoggedConnectionIssue = true;
  }
});

socket.on("disconnect", (reason) => {
  console.log("Disconnected from server:", reason);
});

// Disable auto reconnect after failing the initial attempts
socket.io.on("reconnect_failed", () => {
  console.log("Reconnection failed, stopping further attempts");
  socket.io.reconnection(false); // Disable further reconnection attempts
});

export default socket;
