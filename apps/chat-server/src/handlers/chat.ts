const { io } = require('../server');
import type { Socket } from 'socket.io';
import { createMessage } from '../db';

function registerHandlers() {
  io.on('connection', (socket: Socket) => {
    socket.on('room:join', (roomId) => {
      socket.join(roomId);
      io.to(roomId).emit('room:user_joined', socket.data.user);
    });
    socket.on('room:leave', (roomId) => {
      socket.leave(roomId);
      io.to(roomId).emit('room:user_left', socket.data.user);
    });
    socket.on('messages:send', async (payload) => {
      try {
        const message = await createMessage(
          payload.roomId,
          socket.data.user.id,
          payload.content,
        );
        io.to(payload.roomId).emit('message:received', message);
      } catch (err) {
        socket.emit('error', 'failed to send message');
      }
    });
    socket.on('typing:start', (roomId) => {
      socket.to(roomId).emit('typing:update', {
        userId: socket.data.user.id,
        username: socket.data.user.username,
        isTyping: true,
      });
    });
    socket.on('typing:stop', (roomId) => {
      socket.to(roomId).emit('typing:update', {
        userId: socket.data.user.id,
        username: socket.data.user.username,
        isTyping: false,
      });
    });
    socket.on('disconnect', () => {
      socket.rooms.forEach((roomId) => {
        socket.to(roomId).emit('room:user_left', socket.data.user);
      });
    });
  });
}

module.exports = { registerHandlers };
