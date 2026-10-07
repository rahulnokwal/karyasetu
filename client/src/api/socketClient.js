import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.SOCKET_URL ||
  (import.meta.env.API_BASE_URL || "/api/v1").replace(/\/api\/v1\/?$/, "");

let socket = null;

export const getSocket = () => {
  if (socket) return socket;

  socket = io(SOCKET_URL, {
    withCredentials: true,
    autoConnect: false,
    transports: ["websocket", "polling"],
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    auth: (cb) => {
      const token = localStorage.getItem("karyasetu_access_token");
      cb({ token: token || undefined });
    },
  });

  return socket;
};

export const joinWorkspace = (workspaceId) => {
  if (!workspaceId) return;
  const s = getSocket();
  if (s.connected) s.emit("join_workspace", workspaceId);
  s.once("connect", () => s.emit("join_workspace", workspaceId));
};

export const leaveWorkspace = (workspaceId) => {
  if (!workspaceId) return;
  const s = getSocket();
  if (s.connected) s.emit("leave_workspace", workspaceId);
};

export const onSocket = (event, handler) => {
  const s = getSocket();
  s.on(event, handler);
  return () => s.off(event, handler);
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
