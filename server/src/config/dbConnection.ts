import mongoose from "mongoose";
import config from "./appConfig";

const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB...");
    console.log(`MongoDB URI: ${config.mongodb.uri.substring(0, 20)}...`);
    console.log(`DB Name: ${config.mongodb.dbName}`);

    // Set up MongoDB connection options with shorter timeouts for serverless environment
    const options = {
      dbName: config.mongodb.dbName,
      connectTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 45000, // 45 seconds
      serverSelectionTimeoutMS: 10000, // 10 seconds
      heartbeatFrequencyMS: 30000, // 30 seconds
    };

    await mongoose.connect(config.mongodb.uri, options);
    console.log("MongoDB Connected");

    // Handle connection events
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
    });

    // Gracefully handle process termination
    process.on("SIGINT", async () => {
      try {
        await mongoose.connection.close();
        console.log("MongoDB connection closed due to app termination");
        process.exit(0);
      } catch (err) {
        console.error("Error closing MongoDB connection:", err);
        process.exit(1);
      }
    });
  } catch (err) {
    console.error("MongoDB connection error:", err);

    // In production, don't exit the process, just log the error
    if (process.env.NODE_ENV !== "production") {
      // Only exit in development for immediate feedback
      process.exit(1);
    }
  }
};

export default connectDB;
