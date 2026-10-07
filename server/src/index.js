import "dotenv/config";
import connectDB from "./db/index.js";
import app from "./app.js";
import http from "http";
import { attachSocketServer } from "./socket.js";

const geminiApiKey = process.env.GEMINI_API_KEY?.trim();
const geminiModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const aiRoutesReady = Boolean(geminiApiKey);
console.log(
  `[ai] startup guard — key present: ${aiRoutesReady}, model: ${geminiModel}`
);
if (!aiRoutesReady) {
  console.warn(
    "[ai] GEMINI_API_KEY is not set. AI task-draft / project-summary routes will respond with a fallback and `usedFallback: true` until the key is provided."
  );
}
// eslint-disable-next-line no-console
console.log(
  `[ai] AI routes enabled: ${aiRoutesReady ? "yes" : "no — fallback mode"}`
);

connectDB()
  .then(() => {
    const port = process.env.PORT || 3000;
    const httpServer = http.createServer(app);

    global.__io = attachSocketServer(httpServer);

    const server = httpServer.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`server is listening on port${port}`);
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
