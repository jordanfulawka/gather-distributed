import type { Socket, Server } from 'socket.io';
import { createMessage, getMessagesAfter, getMessagesByRoomId } from '../db';
import type { Redis } from 'ioredis';
import { Message } from '@gather/shared-types';

function registerHandlers(io: Server, redis: Redis) {
  io.on('connection', (socket: Socket) => {
    socket.on('room:join', async (roomId) => {
      socket.join(roomId);
      await redis.hset(
        `presence:${roomId}`,
        socket.data.user.username,
        process.env.SERVER_ID as string,
      );
      io.to(roomId).emit('room:user_joined', socket.data.user);
      const presence = await redis.hgetall(`presence:${roomId}`);
      io.to(roomId).emit('presence:update', presence);
    });
    socket.on('room:leave', async (roomId) => {
      socket.leave(roomId);
      await redis.hdel(`presence:${roomId}`, socket.data.user.username);
      io.to(roomId).emit('room:user_left', socket.data.user);
      const presence = await redis.hgetall(`presence:${roomId}`);
      io.to(roomId).emit('presence:update', presence);
    });
    socket.on('room:rejoin', async ({ roomId, lastMessageId }) => {
      socket.join(roomId);
      await redis.hset(
        `presence:${roomId}`,
        socket.data.user.username,
        process.env.SERVER_ID as string,
      );
      const presence = await redis.hgetall(`presence:${roomId}`);
      socket.emit('presence:update', presence);
      const messages = lastMessageId
        ? await getMessagesAfter(roomId, lastMessageId)
        : await getMessagesByRoomId(roomId);
      messages.forEach((message: Message) => {
        socket.emit('message:received', message);
      });
    });
    socket.on('messages:send', async (payload) => {
      try {
        const uuid = payload.eventId;
        if (await redis.get(`event:${uuid}`)) {
          return;
        }
        await redis.set(`event:${uuid}`, '1', 'EX', 30);
        const message = await createMessage(
          payload.roomId,
          socket.data.user.id,
          payload.content,
        );
        io.to(payload.roomId).emit('message:received', {
          ...message,
          username: socket.data.user.username,
        });
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
    socket.on('disconnecting', async () => {
      for (const roomId of socket.rooms) {
        socket.to(roomId).emit('room:user_left', socket.data.user.id);
        await redis.hdel(`presence:${roomId}`, socket.data.user.username);
        const presence = await redis.hgetall(`presence:${roomId}`);
        io.to(roomId).emit('presence:update', presence);
      }
    });
    socket.on('presence:ping', async (roomId) => {
      await redis.hset(
        `presence:${roomId}`,
        socket.data.user.username,
        process.env.SERVER_ID as string,
      );
      await redis.expire(`presence:${roomId}`, 60);
    });
  });
}

module.exports = { registerHandlers };
