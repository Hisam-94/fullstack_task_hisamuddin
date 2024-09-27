// // import React, { useState } from 'react';
// // import io from 'socket.io-client';

// // const socket = io('http://localhost:8000');

// // const TaskInput: React.FC = () => {
// //   const [newTask, setNewTask] = useState<string>('');

// //   const addTask = () => {
// //     if (newTask.trim()) {
// //       socket.emit('add', newTask);
// //       setNewTask('');
// //     }
// //   };

// //   return (
// //     <div className="flex mb-4">
// //       <input
// //         type="text"
// //         className="border p-2 flex-grow"
// //         value={newTask}
// //         onChange={(e) => setNewTask(e.target.value)}
// //         placeholder="Add a new task"
// //       />
// //       <button className="ml-2 bg-blue-500 text-white p-2" onClick={addTask}>
// //         Add Task
// //       </button>
// //     </div>
// //   );
// // };

// // export default TaskInput;

// import React, { useState } from 'react';
// import { socket } from '../socket'; // Import the socket instance

// const TaskInput: React.FC = () => {
//   const [newTask, setNewTask] = useState<string>('');

//   const addTask = () => {
//     if (newTask.trim()) {
//       socket.emit('add', newTask); // Emit the task to the server
//       setNewTask('');
//     }
//   };

//   return (
//     <div className="flex mb-4">
//       <input
//         type="text"
//         className="border p-2 flex-grow"
//         value={newTask}
//         onChange={(e) => setNewTask(e.target.value)}
//         placeholder="Add a new task"
//       />
//       <button className="ml-2 bg-blue-500 text-white p-2" onClick={addTask}>
//         Add Task
//       </button>
//     </div>
//   );
// };

// export default TaskInput;


import React, { useState } from 'react';
import { socket } from '../socket'; // Import the socket instance
// import addIcon from "../../public/plus-circle-icon.svg"
const TaskInput: React.FC = () => {
  const [newTask, setNewTask] = useState<string>('');

  const addTask = () => {
    if (newTask.trim()) {
      socket.emit('add', newTask); // Emit the task to the server
      setNewTask('');
    }
  };

  return (
    <div className="flex mb-4">
      <input
        type="text"
        className="border border-gray-300 p-2 rounded-lg flex-grow outline-none focus:ring-2 focus:ring-amber-800"
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        placeholder="New Note..."
      />
      <button
        className="ml-2 bg-amber-800 hover:bg-amber-700 text-white p-2 rounded-lg flex items-center"
        onClick={addTask}
      >
        <span className="material-icons"><img src="/plus-circle-icon.svg" alt='addIcon'/></span> {/* Placeholder for add icon */}
        <span className="ml-1">Add</span>
      </button>
    </div>
  );
};

export default TaskInput;
