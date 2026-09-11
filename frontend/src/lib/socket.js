import { io } from "socket.io-client";

let socket;

export function getSocket(token) {
  if (!socket) {
    socket = io(`${import.meta.env.VITE_API_URL}/chat`, {
      auth: { token },
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });
  }
  return socket;
}