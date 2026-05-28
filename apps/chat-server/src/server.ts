import { Server } from 'socket.io';
const http = require('http');
const express = require('express');
const cors = require('cors');
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from '@gather/socket-events';
const { authMiddleware } = require('./middleware');
const { registerHandlers } = require('./handlers');
const { authRouter } = require('./routes/auth');
const { roomsRouter } = require('./routes/rooms');

const app = express();
app.use(express.json);
app.use(cors());
app.use('/auth', authRouter);
app.user('/rooms', roomsRouter);

const httpServer = http.createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: { origin: '*' },
});

io.use(authMiddleware);
registerHandlers();

module.exports = { app, httpServer, io };
