// import React from 'react';

// interface TaskListProps {
//   tasks: string[];
// }

// const TaskList: React.FC<TaskListProps> = ({ tasks }) => {
//   return (
//     <ul>
//       {tasks.map((task, index) => (
//         <li key={index} className="border-b p-2">
//           {task}
//         </li>
//       ))}
//     </ul>
//   );
// };

// export default TaskList;


import React from 'react';
import './TaskList.css'; // Import your CSS file

interface TaskListProps {
  tasks: string[];
}

const TaskList: React.FC<TaskListProps> = ({ tasks }) => {
  return (
    <div className="mt-4">
      {/* <h2 className="text-lg font-medium mb-2">Notes</h2> */}
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
