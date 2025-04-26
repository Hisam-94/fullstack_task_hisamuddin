import React, { useState, useContext } from "react";
import socket from "../socket";
import { TaskContext } from "../pages/TodoApp";

const TaskInput: React.FC = () => {
  const [newTask, setNewTask] = useState<string>("");
  const [isPending, setIsPending] = useState<boolean>(false);
  const { refreshTasks } = useContext(TaskContext);

  const addTask = async () => {
    if (newTask.trim()) {
      setIsPending(true);

      try {
        // Try socket first
        const socketPromise = new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error("Socket timeout"));
          }, 5000);

          socket.emit("add", newTask);

          socket.once("taskAdded", () => {
            clearTimeout(timeout);
            resolve("Success via socket");
          });

          socket.once("error", (err) => {
            clearTimeout(timeout);
            reject(new Error(err));
          });
        });

        try {
          // Try socket first
          await socketPromise;
          console.log("Task added via socket");
        } catch (socketError) {
          console.log("Socket failed, trying REST API", socketError);

          // Fallback to REST API
          const apiUrl =
            process.env.REACT_APP_API_URL || "http://localhost:8000";
          const response = await fetch(`${apiUrl}/api/tasks/add`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ task: newTask }),
          });

          if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
          }

          console.log("Task added via REST API");
          // Refresh tasks after adding via REST API
          refreshTasks();
        }

        // Success - clear the input
        setNewTask("");
      } catch (error) {
        console.error("Failed to add task:", error);
        alert("Failed to add task. Please try again.");
      } finally {
        setIsPending(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newTask.trim()) {
      addTask();
    }
  };

  return (
    <div className="flex flex-col sm:flex-row mb-4">
      <input
        type="text"
        className="border border-gray-300 p-2 rounded-lg flex-grow outline-none focus:ring-2 focus:ring-amber-800"
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="New Note..."
        disabled={isPending}
      />
      <button
        className={`mt-2 sm:mt-0 sm:ml-2 p-2 rounded-lg flex items-center justify-center ${
          isPending
            ? "bg-amber-600 cursor-not-allowed"
            : "bg-amber-800 hover:bg-amber-700"
        } text-white`}
        onClick={addTask}
        disabled={isPending || !newTask.trim()}>
        {isPending ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Adding...</span>
          </>
        ) : (
          <>
            <span className="material-icons">
              <img src="/plus-circle-icon.svg" alt="addIcon" />
            </span>
            <span className="ml-1">Add</span>
          </>
        )}
      </button>
    </div>
  );
};

export default TaskInput;
