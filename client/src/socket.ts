import { io, Socket } from "socket.io-client";

// Get the API URL from environment variables, fallback to localhost if not set
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

// Create socket instance
export const socket: Socket = io(API_URL, {
  withCredentials: true,
  transports: ["websocket", "polling"],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 10000,
});

// Socket connection event handlers
socket.on("connect", () => {
  console.log("Connected to server");
});

socket.on("connect_error", (error) => {
  console.error("Connection error:", error);
});

socket.on("disconnect", (reason) => {
  console.log("Disconnected from server:", reason);
});

socket.on("reconnect_attempt", (attempt) => {
  console.log(`Trying to reconnect: attempt ${attempt}`);
});

socket.on("reconnect_failed", () => {
  console.error("Failed to reconnect to server");
});

export default socket;
