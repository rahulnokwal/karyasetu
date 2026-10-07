import "dotenv/config";
import connectDB from "./db/index.js";
import app from "./app.js";
import http from "http";
import { attachSocketServer } from "./socket.js";

connectDB()
  .then(() => {
    const port = process.env.PORT || 3000;
    const httpServer = http.createServer(app);

    global.__io = attachSocketServer(httpServer);

    const server = httpServer.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`server is listening`);
    });

    server.on("error", (error) => {
      // eslint-disable-next-line no-console
      console.error("Server error:", error);
      // eslint-disable-next-line no-process-exit
      process.exit(1);
    });
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error("MongoDB connection failure", error);
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  });
