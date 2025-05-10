import { Server } from 'socket.io';
import { initializeSocket as initializeScheduleSocket } from './controllers/scheduleController';

export const initializeSocket = (server: any, corsOrigin: string) => {
  const io = new Server(server, {
    cors: {
      origin: corsOrigin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Initialize Socket.IO listeners for the schedule controller
  initializeScheduleSocket(io);

  return io;
};