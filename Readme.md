# Full Stack Task - To-Do Application  

## Overview  
This project implements a full-stack To-Do List app using Node.js with WebSockets and HTTP API for backend functionality, along with React.js for the front end. It includes Redis for caching and MongoDB for persistent storage.

## Deployment

- Frontend: https://fullstack-task-hisamuddin-1.onrender.com
- Backend: https://fullstack-task-hisamuddin-server.onrender.com

## Features
- Add Tasks: Users can submit new tasks via WebSocket messages using the add event.
- Redis Cache: Tasks are temporarily stored in Redis under the key FULLSTACK_TASK_HISAMUDDIN.
- MongoDB Integration: When the task count in Redis exceeds 50, the tasks are transferred to MongoDB for long-term storage and removed from Redis.
- API Access: Retrieve all tasks by making a request to the /fetchAllTasks endpoint via HTTP.
- Responsive Design: The front-end is developed in React.js, based on a Figma design, with responsive styling provided by Tailwind CSS. The interface is optimized for mobile and tablet devices.

## Technologies Used  
- **Backend:**  
  - Node.js
  - Express.js
  - TypeScript
  - MongoDB with Mongoose
  - Redis (for caching)
  - Socket.IO (for WebSocket communication)
  
- **Frontend:**  
  - React.js 
  - Tailwind CSS
    
## You need to run npm start in both the server and client

## ---------------------------------- Backend -------------------------------------
## Prerequisites  
Before you begin, ensure you have met the following requirements:

- You have installed the latest version of Node.js and npm
- You have a Windows/Linux/Mac machine.
- You have installed MongoDB
- You have installed Redis
- You are familiar with TypeScript basics
- You have basic knowledge of Express.js, MongoDB, and Redis

Optional but recommended:

- You have installed a modern code editor like Visual Studio Code
- You are familiar with Socket.IO for real-time applications
  
## Project Structure
```
root/
│   .env
│   .gitignore
│   package.json
│   tsconfig.json
│
└───src/
    │   server.ts
    ├───config/
    ├───controllers/
    ├───models/
    └───routes/
```
### Environment Variables

Make sure to set up the following environment variables in your `.env` file:

- `REDIS_PASSWORD`: Password for Redis connection
- `REDIS_USERNAME`: Username for Redis connection
- `REDIS_PORT`: Port number for Redis server
- `REDIS_HOST`: Hostname or IP address of Redis server
- `MONGO_DB_NAME`: Name of your MongoDB database
- `MONGO_URI`: Connection URI for MongoDB

Example `.env` file:

```
REDIS_PASSWORD=your_redis_password
REDIS_USERNAME=your_redis_username
REDIS_PORT=6379
REDIS_HOST=localhost
MONGO_DB_NAME=your_database_name
MONGO_URI=mongodb://localhost:27017/your_database_name
```

## Setup

1. Clone the repository
2. Navigate to the server directory:
   ```
   cd server
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Set up your `.env` file with necessary environment variables (see [Environment Variables](#environment-variables) section)
5. Start the backend server:
   ```
   npm start
   ```

## ---------------------------------- Frontend ------------------------------------
## Prerequisites  
Before you begin, ensure you have met the following requirements:

- You have installed the latest version of Node.js and npm
- You have a Windows/Linux/Mac machine.
= You have read Create React App documentation.

Optional but recommended:

- You have installed a modern code editor like Visual Studio Code.
- You are familiar with TypeScript basics (as your components are in .tsx files).

## Project Structure
```
frontend-root/
│   .gitignore
│   package.json
│   README.md
│   tsconfig.json (if using TypeScript)
│
└───src/
    │   index.js/ts
    │   App.js/ts
    │   App.css
    │
    ├───components/
    │       TaskInput.tsx
    │       TaskList.tsx
    │       TaskList.css
    │
    └───Pages/
            TodoApp.tsx
```
### Environment Variables

Make sure to set up the following environment variables in your `.env` file:

- `REACT_APP_API_URL`: Server Url
  
Example `.env` file:

```
REACT_APP_API_URL=http://localhost:8000
```

## Setup

1. Clone the repository
2. Navigate to the client directory:
   ```
   cd client
   ```
4. Install dependencies:
   ```
   npm install
   ```
5. Set up your `.env` file with the necessary environment variables (see [Environment Variables](#environment-variables) section)
6. Start the development server:
   ```
   npm start
   ```