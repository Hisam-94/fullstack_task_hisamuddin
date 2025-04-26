import React, { useEffect, useState, useCallback } from "react";
import TaskInput from "../components/TaskInput";
import TaskList from "../components/TaskList";
import socket from "../socket";

interface TaskState {
  unsavedTasks: string[];
  mongoDBTasks: string[];
  isLoading: boolean;
  error: string | null;
}

// Create a context to expose the refresh function
export const TaskContext = React.createContext({
  refreshTasks: () => {},
});

const TodoApp: React.FC = () => {
  const [state, setState] = useState<TaskState>({
    unsavedTasks: [],
    mongoDBTasks: [],
    isLoading: true,
    error: null,
  });

  const fetchTasks = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:8000";
      console.log("Fetching tasks from:", apiUrl);

      const response = await fetch(`${apiUrl}/api/tasks/fetchAllTasks`);

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const { unsavedTasks, mongoDBTasks } = await response.json();
      console.log("Tasks fetched successfully:", {
        unsavedTasks,
        mongoDBTasks,
      });

      setState((prev) => ({
        ...prev,
        unsavedTasks: unsavedTasks || [],
        mongoDBTasks: mongoDBTasks || [],
        isLoading: false,
      }));
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      setState((prev) => ({
        ...prev,
        error: "Failed to load tasks. Please try again later.",
        isLoading: false,
      }));
    }
  }, []);

  // Expose the refreshTasks function to child components
  const contextValue = {
    refreshTasks: fetchTasks,
  };

  useEffect(() => {
    fetchTasks();

    // Set up socket event listeners
    socket.on(
      "taskAdded",
      ({
        unsavedTasks,
        mongoDBTasks,
      }: {
        unsavedTasks: string[];
        mongoDBTasks: string[];
      }) => {
        console.log("Socket taskAdded event received", {
          unsavedTasks,
          mongoDBTasks,
        });
        setState((prev) => ({
          ...prev,
          unsavedTasks: unsavedTasks || [],
          mongoDBTasks: mongoDBTasks || [],
        }));
      }
    );

    socket.on("error", (errorMessage: string) => {
      console.error("Socket error:", errorMessage);
      setState((prev) => ({ ...prev, error: errorMessage }));
      // Clear error after 5 seconds
      setTimeout(() => {
        setState((prev) => ({ ...prev, error: null }));
      }, 5000);
    });

    return () => {
      socket.off("taskAdded");
      socket.off("error");
    };
  }, [fetchTasks]);

  const { unsavedTasks, mongoDBTasks, isLoading, error } = state;
  const allTasks = [...unsavedTasks, ...mongoDBTasks];

  return (
    <TaskContext.Provider value={contextValue}>
      <div className="w-full max-w-md lg:max-w-4xl mx-auto mt-8 p-6 bg-white border border-gray-300 rounded-lg shadow-md">
        <h1 className="text-2xl lg:text-4xl font-bold mb-4 flex items-center lg:justify-center">
          <img
            src="/notes-app-icon.svg"
            alt="Note App"
            className="w-9 h-9 lg:w-12 lg:h-12 mr-2"
          />
          Note App
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <TaskInput />

        <div className="mt-4">
          <h2 className="text-lg lg:text-2xl font-bold mb-2">Notes</h2>

          {isLoading ? (
            <div className="text-center py-4">
              <svg
                className="animate-spin h-6 w-6 text-amber-800 mx-auto"
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
              <p className="mt-2">Loading notes...</p>
            </div>
          ) : allTasks.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No notes yet. Add your first note above!
            </div>
          ) : (
            <TaskList tasks={allTasks} />
          )}
        </div>
      </div>
    </TaskContext.Provider>
  );
};

export default TodoApp;
