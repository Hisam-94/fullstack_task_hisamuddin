import React, { useEffect, useState } from "react";
import TaskInput from "../components/TaskInput";
import TaskList from "../components/TaskList";
import { socket } from "../socket";

const TodoApp: React.FC = () => {
  const [unsavedTasks, setunsavedTasks] = useState<string[]>([]);
  const [mongoDBTasks, setMongoDBTasks] = useState<string[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/tasks/fetchAllTasks`
      );
      const { unsavedTasks, mongoDBTasks } = await response.json();
      setunsavedTasks(unsavedTasks); 
      setMongoDBTasks(mongoDBTasks)
    };

    fetchTasks();

    socket.on("taskAdded", ({ unsavedTasks, mongoDBTasks }: { unsavedTasks: string[], mongoDBTasks: string[] }) => {
      setunsavedTasks(unsavedTasks); 
      setMongoDBTasks(mongoDBTasks); 
    });

    return () => {
      socket.off("taskAdded");
    };
  }, []); 

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
