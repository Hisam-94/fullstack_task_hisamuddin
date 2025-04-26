import React from "react";
import "./TaskList.css";

interface TaskListProps {
  tasks: string[];
}

const TaskList: React.FC<TaskListProps> = ({ tasks }) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No notes yet. Add your first note above!
      </div>
    );
  }

  return (
    <div className="mt-4">
      <ul className="max-h-60 overflow-y-auto border-t border-gray-200 custom-scrollbar">
        {tasks.map((task, index) => (
          <li
            key={index}
            className="border-b border-gray-200 p-3 lg:p-4 hover:bg-gray-50 transition flex">
            <div className="flex-grow break-words">{task}</div>
            <span className="text-xs text-gray-400 self-start pt-1">
              {`Task ${index + 1}`}
            </span>
          </li>
        ))}
      </ul>
      <div className="text-right text-xs text-gray-500 mt-2">
        Total: {tasks.length} {tasks.length === 1 ? "note" : "notes"}
      </div>
    </div>
  );
};

export default TaskList;
