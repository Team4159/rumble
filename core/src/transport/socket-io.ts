import socketIO, { Server } from 'socket.io';
import http from 'http';

export const createSocketEngine = (server: http.Server): Server => {
  const io = socketIO(server);
  io.on('connection', () => {
    console.log('hi');
  });
  return io;
};
