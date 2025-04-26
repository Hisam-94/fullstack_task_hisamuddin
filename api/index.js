const path = require("path");
const fs = require("fs");

// This is necessary because Vercel serves functions from a different location
if (fs.existsSync("./.env")) {
  require("dotenv").config();
}

// Dynamically import the server build
const serverPath = path.join(process.cwd(), "server/dist/server.js");

// Export a handler that forwards requests to the Express server
module.exports = async (req, res) => {
  try {
    // Dynamically import the server
    const server = require(serverPath);

    // The Express app should handle the request
    return server.default(req, res);
  } catch (error) {
    console.error("Serverless function error:", error);
    return res.status(500).send("Server error");
  }
};
