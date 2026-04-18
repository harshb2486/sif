import { io } from 'socket.io-client';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

let socket = null;

export const connectRealtimeSocket = (token) => {
  if (!token) return null;
  if (socket?.connected) return socket;

  socket = io(API_BASE_URL, {
    transports: ['websocket'],
    auth: { token }
  });

  return socket;
};

export const getRealtimeSocket = () => socket;

export const disconnectRealtimeSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
