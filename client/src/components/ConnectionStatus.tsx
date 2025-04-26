import React, { useState, useEffect } from "react";
import socket from "../socket";

const ConnectionStatus: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [apiStatus, setApiStatus] = useState("unknown");

  useEffect(() => {
    // Check Socket.IO connection
    const handleConnect = () => setConnectionStatus("connected");
    const handleDisconnect = () => setConnectionStatus("disconnected");
    const handleError = () => setConnectionStatus("error");

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleError);

    // Set initial status
    if (socket.connected) {
      setConnectionStatus("connected");
    }

    // Check API connection
    const checkApi = async () => {
      try {
        setApiStatus("checking");
        const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:8000";
        const response = await fetch(`${apiUrl}/api/tasks/fetchAllTasks`);

        if (response.ok) {
          setApiStatus("connected");
        } else {
          setApiStatus("error");
        }
      } catch (error) {
        console.error("API check failed:", error);
        setApiStatus("error");
      }
    };

    checkApi();

    // Clean up
    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleError);
    };
  }, []);

  return (
    <div className="text-xs text-gray-500 mt-4 p-2 border border-gray-200 rounded">
      <div>
        Socket.IO:
        <span
          className={
            connectionStatus === "connected"
              ? "text-green-500 ml-1"
              : connectionStatus === "error"
              ? "text-red-500 ml-1"
              : "text-yellow-500 ml-1"
          }>
          {connectionStatus}
        </span>
      </div>

      <div>
        API:
        <span
          className={
            apiStatus === "connected"
              ? "text-green-500 ml-1"
              : apiStatus === "error"
              ? "text-red-500 ml-1"
              : "text-yellow-500 ml-1"
          }>
          {apiStatus}
        </span>
      </div>

      <div className="mt-1">
        API URL: {process.env.REACT_APP_API_URL || "http://localhost:8000"}
      </div>
    </div>
  );
};

export default ConnectionStatus;
