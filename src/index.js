import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});
import connectDB from "./db/index.js";
import app from "./app.js";

connectDB()
  .then(() => {
    const port = process.env.PORT || 3000;
    const server = app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`server is listening on http://localhost:${port}`);
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
