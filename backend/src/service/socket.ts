// socket.ts
import { Server } from 'socket.io';

let io: Server | null = null;

export const setIo = (socketIo: Server) => {
    io = socketIo;
};

export const getIo = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};