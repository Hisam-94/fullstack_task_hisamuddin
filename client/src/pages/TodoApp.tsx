// import React, { useEffect, useState } from "react";
// import TaskInput from "../components/TaskInput";
// import TaskList from "../components/TaskList";
// import { socket } from "../socket"; // Import the socket instance

// const TodoApp: React.FC = () => {
//   // Separate states for local and MongoDB tasks
//   const [unsavedTasks, setunsavedTasks] = useState<string[]>([]);
//   const [mongoDBTasks, setMongoDBTasks] = useState<string[]>([]);

//   useEffect(() => {
//     // Fetch initial tasks from API
//     const fetchTasks = async () => {
//       const response = await fetch(
//         "http://localhost:8000/api/tasks/fetchAllTasks"
//       );
//       const { unsavedTasks, mongoDBTasks } = await response.json();
//       // setMongoDBTasks(data); // Assuming the API returns MongoDB 
//       setunsavedTasks(unsavedTasks); // Update local tasks
//       setMongoDBTasks(mongoDBTasks)
//     };

//     fetchTasks();

//     // Listen for task updates via WebSocket
//     socket.on("taskAdded", ({ unsavedTasks, mongoDBTasks }: { unsavedTasks: string[], mongoDBTasks: string[] }) => {
//       setunsavedTasks(unsavedTasks); // Update local tasks
//       setMongoDBTasks(mongoDBTasks); // Update MongoDB tasks
//     });

//     // Cleanup on unmount to avoid memory leaks
//     return () => {
//       socket.off("taskAdded");
//     };
//   }, []); // Empty dependency array ensures this runs only once after mount

//   return (
//     <div className="w-full max-w-md mx-auto mt-[3rem] p-6 bg-white border border-gray-300 rounded-lg shadow-md">
//       <h1 className="text-2xl font-semibold mb-4 flex items-center">
//         <img
//           src="/notes-app-icon.svg"
//           alt="Note App"
//           className="w-9 h-9 mr-2"
//         />
//         Note App
//       </h1>
//       <TaskInput />
//       {/* Render local and MongoDB tasks separately */}
//       <div className="mt-4">
//         <h2 className="text-lg font-medium mb-2">Unsaved Notes</h2>
//         <TaskList tasks={unsavedTasks} />

//         <h2 className="text-lg font-medium mt-4 mb-2">Notes from MongoDB</h2>
//         <TaskList tasks={mongoDBTasks} />
//       </div>
//     </div>
//   );
// };

// export default TodoApp;

import React, { useEffect, useState } from "react";
import TaskInput from "../components/TaskInput";
import TaskList from "../components/TaskList";
import { socket } from "../socket";

const TodoApp: React.FC = () => {
  const [unsavedTasks, setunsavedTasks] = useState<string[]>([]);
  const [mongoDBTasks, setMongoDBTasks] = useState<string[]>([]);

  useEffect(() => {
    // Fetch initial tasks from API
    const fetchTasks = async () => {
      const response = await fetch(
        "http://localhost:8000/api/tasks/fetchAllTasks"
      );
      const { unsavedTasks, mongoDBTasks } = await response.json();
      setunsavedTasks(unsavedTasks); // Update local tasks
      setMongoDBTasks(mongoDBTasks)
    };

    fetchTasks();

    // Listen for task updates via WebSocket
    socket.on("taskAdded", ({ unsavedTasks, mongoDBTasks }: { unsavedTasks: string[], mongoDBTasks: string[] }) => {
      setunsavedTasks(unsavedTasks); // Update local tasks
      setMongoDBTasks(mongoDBTasks); // Update MongoDB tasks
    });

    // Cleanup on unmount to avoid memory leaks
    return () => {
      socket.off("taskAdded");
    };
  }, []); // Empty dependency array ensures this runs only once after mount

  return (
    <div className="w-full max-w-md mx-auto mt-[3rem] p-6 bg-white border border-gray-300 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4 flex items-center">
        <img
          src="/notes-app-icon.svg"
          alt="Note App"
          className="w-9 h-9 mr-2"
        />
        Note App
      </h1>
      <TaskInput />
      <div className="mt-4">
        <h2 className="text-lg font-bold mb-2">Notes</h2>
        <TaskList tasks={[...unsavedTasks, ...mongoDBTasks]} />
        </div>
    </div>
  );
};

export default TodoApp;
