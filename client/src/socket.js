import { io } from 'socket.io-client';

// For local development, use localhost
// For production, use your deployed server URL
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'https://brain-blast-server.onrender.com';

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  transports: ['websocket', 'polling']
});

export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};