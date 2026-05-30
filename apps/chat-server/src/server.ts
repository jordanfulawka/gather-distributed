require('dotenv').config();
import { Server } from 'socket.io';
const http = require('http');
const express = require('express');
const cors = require('cors');
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from '@gather/socket-events';
import { createAdapter } from '@socket.io/redis-adapter';
const { authMiddleware } = require('./middleware/auth');
const { registerHandlers } = require('./handlers/chat');
const { authRouter } = require('./routes/auth');
const { roomsRouter } = require('./routes/rooms');
const { Redis } = require('ioredis');

const app = express();
app.use(express.json());
app.use(cors());
app.use('/auth', authRouter);
app.use('/rooms', roomsRouter);

const httpServer = http.createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: { origin: '*' },
});

console.log('REDIS_URL:', process.env.REDIS_URL);
const pubClient = new Redis(process.env.REDIS_URL);
const subClient = pubClient.duplicate();
io.adapter(createAdapter(pubClient, subClient));

io.use(authMiddleware);
registerHandlers(io);

module.exports = { app, httpServer, io };
