import { Request, Response } from "express";
const redisClient = require('../config/redis');
import { Task } from "../models/taskModel";

export const fetchAllTasks = async (req: Request, res: Response) => {
  try {
    const redisTasks = await redisClient.get('FULLSTACK_TASK_HISAMUDDIN');
    const tasksFromRedis = redisTasks ? JSON.parse(redisTasks) : [];

    const tasksFromMongoDB = await Task.find({});
    const tasksFromMongoDBArray = tasksFromMongoDB.length > 0 ? tasksFromMongoDB.flatMap(tasks => tasks.tasks) : [];

    console.log("tasksFromMongoDBArray:", tasksFromMongoDBArray);
    console.log("tasksFromRedis:", tasksFromRedis);
    console.log("tasksFromRedis.length:", tasksFromRedis.length);

    // const allTasks = [...tasksFromRedis, ...tasksFromMongoDBArray];

    // res.json(allTasks.length > 0 ? allTasks : []);

    res.json({
      unsavedTasks: tasksFromRedis,
      mongoDBTasks: tasksFromMongoDBArray ? tasksFromMongoDBArray : [],
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};
