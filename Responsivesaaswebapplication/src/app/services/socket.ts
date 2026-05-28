import { io, Socket } from 'socket.io-client';

// The backend URL — in dev the Vite proxy forwards /api to port 5000,
// but Socket.IO needs the raw server URL.
const SOCKET_URL =
  import.meta.env.VITE_BACKEND_URL ||
  (import.meta.env.DEV ? 'http://localhost:5000' : window.location.origin);

let socket: Socket | null = null;

/**
 * Returns the shared Socket.IO client, creating it on first call.
 * Token is read from localStorage so it's always current.
 */
export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
      auth: (cb) => {
        cb({ token: localStorage.getItem('bf_token') || '' });
      },
    });
  }
  return socket;
};

export const connectSocket = () => {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
};

export const disconnectSocket = () => {
  socket?.disconnect();
};
