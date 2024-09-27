import React, { useState } from 'react';
import { socket } from '../socket';

const TaskInput: React.FC = () => {
  const [newTask, setNewTask] = useState<string>('');

  const addTask = () => {
    if (newTask.trim()) {
      socket.emit('add', newTask);
      setNewTask('');
    }
  };

  return (
    <div className="flex flex-col sm:flex-row mb-4">
      <input
        type="text"
        className="border border-gray-300 p-2 rounded-lg flex-grow outline-none focus:ring-2 focus:ring-amber-800"
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        placeholder="New Note..."
      />
      <button
        className="mt-2 sm:mt-0 sm:ml-2 bg-amber-800 hover:bg-amber-700 text-white p-2 rounded-lg flex items-center justify-center"
        onClick={addTask}
      >
        <span className="material-icons">
          <img src="/plus-circle-icon.svg" alt="addIcon" />
        </span>
        <span className="ml-1">Add</span>
      </button>
    </div>
  );
};

export default TaskInput;
