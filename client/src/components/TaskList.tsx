import React from 'react';
import './TaskList.css'; 

interface TaskListProps {
  tasks: string[];
}

const TaskList: React.FC<TaskListProps> = ({ tasks }) => {
  return (
    <div className="mt-4">
      <ul className="max-h-60 overflow-y-auto border-t border-gray-200 custom-scrollbar">
        {tasks.map((task, index) => (
          <li key={index} className="border-b border-gray-200 p-2 hover:bg-gray-50 transition">
            {task}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TaskList;
