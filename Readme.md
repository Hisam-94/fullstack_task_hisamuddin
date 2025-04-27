# Full Stack Task - To-Do Application

## Overview

This project implements a full-stack To-Do List app using Node.js with WebSockets and HTTP API for backend functionality, along with React.js for the front end. It includes Redis for caching and MongoDB for persistent storage.

## Live Deployment

- **Frontend**: [https://fullstack-task-hisamuddin-u53c.vercel.app](https://fullstack-task-hisamuddin-u53c.vercel.app)
- **Backend**: [https://fullstack-task-hisamuddin-1.onrender.com](https://fullstack-task-hisamuddin-1.onrender.com)

## Features

- **Real-time Task Management**: Add tasks using WebSocket communication for instant updates
- **Efficient Data Storage**:
  - Redis Cache: Tasks stored in Redis under key `FULLSTACK_TASK_HISAMUDDIN`
  - MongoDB Integration: Tasks moved to MongoDB when Redis count exceeds 50
- **RESTful API**: Retrieve all tasks via the `/fetchAllTasks` endpoint
- **Responsive Design**: Mobile and tablet-friendly UI built with React and Tailwind CSS
- **Fallback Mechanisms**: Graceful handling of connection issues with REST API fallback
- **Notification System**: Visual feedback for successful task addition and errors

## Tech Stack

### Backend

- **Node.js & Express**: Server framework for handling HTTP requests and WebSocket connections
- **TypeScript**: Type-safe JavaScript for better development experience and fewer runtime errors
- **MongoDB**: Persistent storage with Mongoose ODM for task storage beyond Redis limits
- **Redis**: In-memory caching for fast access to recent tasks
- **Socket.IO**: Real-time WebSocket communication for instant task updates
- **Nodemon**: Development tool for auto-reloading during development

### Frontend

- **React.js**: UI library with functional components and hooks for state management
- **TypeScript**: Type safety for components and better developer experience
- **Tailwind CSS**: Utility-first styling framework for responsive design
- **Socket.IO Client**: Real-time communication with the backend
- **React Context API**: For state management across components

## Project Structure

### Root Structure

```
fullstack_task_hisamuddin/
├── client/              # Frontend React application
├── server/              # Backend Node.js application
├── .gitignore           # Git ignore file
└── README.md            # Project documentation
```

### Frontend Structure

```
client/
├── public/              # Static assets
│   ├── index.html       # HTML template
│   ├── notes-app-icon.svg  # App icon
│   └── plus-circle-icon.svg  # Add button icon
├── src/                 # Source code
│   ├── components/      # React components
│   │   ├── TaskInput.tsx    # Component for adding tasks
│   │   ├── TaskList.tsx     # Component for displaying tasks
│   │   └── TaskList.css     # Styles for TaskList
│   ├── pages/           # Page components
│   │   └── TodoApp.tsx      # Main application page
│   ├── App.tsx          # Root component
│   ├── index.tsx        # Entry point
│   └── socket.ts        # Socket.IO client configuration
├── .env                 # Environment variables
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── tailwind.config.js   # Tailwind CSS configuration
```

### Backend Structure

```
server/
├── src/                 # Source code
│   ├── config/          # Configuration files
│   │   ├── appConfig.ts     # Application configuration
│   │   ├── dbConnection.ts  # MongoDB connection setup
│   │   ├── redis.ts         # Redis client configuration
│   │   └── socketio.ts      # Socket.IO server setup
│   ├── controllers/     # Request handlers
│   │   └── taskController.ts  # Task-related controllers
│   ├── models/          # Database models
│   │   └── taskModel.ts      # Task MongoDB schema
│   ├── routes/          # API routes
│   │   └── taskRoutes.ts     # Task-related routes
│   └── server.ts        # Entry point
├── dist/                # Compiled JavaScript files
├── .env                 # Environment variables
├── package.json         # Dependencies and scripts
└── tsconfig.json        # TypeScript configuration
```

## Project Architecture

The application follows a modern architecture with:

- **WebSocket-first approach** for real-time updates with fallback to REST API
- **Caching layer** with Redis for frequent access and low latency
- **Long-term storage** with MongoDB for data persistence
- **Responsive React frontend** with Tailwind CSS for all device sizes
- **Context API** for state management and component communication

## Getting Started

### Prerequisites

- Node.js (v14+) and npm
- MongoDB instance (local or remote)
- Redis instance (local or remote)
- Git

### Backend Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/Hisam-94/fullstack_task_hisamuddin.git
   cd fullstack_task_hisamuddin
   ```

2. Configure server environment:

   ```bash
   cd server
   npm install
   ```

3. Create `.env` file with:

   ```
   PORT=8000
   MONGO_URI=your_mongodb_connection_string
   MONGO_DB_NAME=Kazam
   REDIS_HOST=your_redis_host
   REDIS_PORT=your_redis_port
   REDIS_USERNAME=your_redis_username
   REDIS_PASSWORD=your_redis_password
   ```

4. Start the server:
   ```bash
   npm run dev   # Development with hot-reload
   # or
   npm start     # Production build
   ```

### Frontend Setup

1. Navigate to client directory:

   ```bash
   cd client
   npm install
   ```

2. Create `.env` file with:

   ```
   REACT_APP_API_URL=http://localhost:8000  # For local development
   ```

3. Start the client:
   ```bash
   npm start
   ```

## WebSocket Implementation Details

The application uses a WebSocket-first approach for real-time communication:

1. **Client-Side**:

   - Socket connection established on app load
   - Tasks added by emitting the `add` event with task content
   - Listens for `taskAdded` event to update UI immediately
   - Handles connection errors with fallback to REST API

2. **Server-Side**:
   - Socket.IO server initialized with CORS configuration
   - Handles `add` event by storing task in Redis
   - Monitors Redis task count for MongoDB migration
   - Broadcasts `taskAdded` event to all connected clients
   - Provides detailed error feedback

## API Endpoints

- `GET /api/tasks/fetchAllTasks`: Retrieves all tasks from Redis and MongoDB
- `POST /api/tasks/add`: Fallback REST endpoint for adding tasks when WebSocket connection fails

## Data Flow

1. **Task Addition**:

   - User adds task via UI
   - Task sent to server via WebSocket
   - Server stores in Redis
   - Server broadcasts update to all clients
   - If Redis exceeds limit, tasks moved to MongoDB

2. **Task Retrieval**:
   - Client requests tasks on initial load
   - Server fetches from both Redis and MongoDB
   - Combined results sent to client

## Deployment Notes

- **WebSocket Support**: For full WebSocket functionality, deploy the backend to a service that supports persistent connections (not serverless).
- **Environment Variables**: Ensure all required environment variables are set in your deployment platform.
- **Redis Configuration**: Make sure your Redis instance is properly configured and accessible.
- **CORS Settings**: The backend is configured to accept connections from the frontend domain.

## Troubleshooting

- **Socket Connection Issues**: Check if your hosting provider supports WebSockets
- **Task Not Adding**: Verify Redis connection and credentials
- **Tasks Not Displaying**: Ensure MongoDB connection is working

## Future Improvements

- Task deletion and editing functionality
- User authentication and personal task lists
- Task categorization and filtering
- Offline support with local storage
- Progressive Web App capabilities
- Task completion status tracking
- Due dates and reminders

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

_Developed by Hisamuddin - A Kazam EV Tech Assignment_
