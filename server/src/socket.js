import { Server as SocketIOServer } from "socket.io";
import jwt from "jsonwebtoken";
import User from "./models/user.models.js";
import WorkspaceMember from "./models/workspaceMember.models.js";

export const attachSocketServer = (httpServer) => {
  const allowedOrigins = (process.env.CORS_ORIGIN || "*")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: allowedOrigins.includes("*") ? true : allowedOrigins,
      credentials: true,
      methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    },

    transports: ["polling", "websocket"],
  });

  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace("Bearer ", "") ||
        socket.handshake.headers?.cookie;

      if (!token) return next(new Error("Unauthorized: token missing"));

      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decoded._id).select(
        "-password -refreshToken"
      );
      if (!user) return next(new Error("Unauthorized: user does not exist"));

      socket.user = user;
      return next();
    } catch {
      return next(new Error("Unauthorized: invalid or expired token"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = socket.user._id.toString();
    console.log(`[socket] connected ${userId} (${socket.id})`);

    try {
      const memberships = await WorkspaceMember.find({
        userId: socket.user._id,
      })
        .select("workspaceId")
        .lean();

      memberships.forEach((m) => socket.join(`workspace:${m.workspaceId}`));
      console.log(
        `[socket] user ${userId} joined ${memberships.length} workspace room(s)`
      );
    } catch (error) {
      console.error("[socket] failed to join workspace rooms:", error.message);
    }

    socket.on("join_workspace", (workspaceId) => {
      if (workspaceId) socket.join(`workspace:${workspaceId}`);
    });

    socket.on("leave_workspace", (workspaceId) => {
      if (workspaceId) socket.leave(`workspace:${workspaceId}`);
    });

    socket.on("disconnect", (reason) => {
      console.log(`[socket] disconnected ${userId} (${reason})`);
    });
  });

  return io;
};

export const emitTaskUpdated = (task, { actorSocketId, event } = {}) => {
  if (!global.__io || !task?.workspaceId) return;
  const room = `workspace:${task.workspaceId}`;
  const target = actorSocketId
    ? global.__io.to(room).except(actorSocketId)
    : global.__io.to(room);

  target.emit(event || "task_updated", {
    task,
    workspaceId: task.workspaceId?.toString?.() ?? task.workspaceId,
    emittedAt: new Date().toISOString(),
  });
};

export const emitTaskCreated = (task, options = {}) =>
  emitTaskUpdated(task, { ...options, event: "task_created" });
