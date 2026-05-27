import { Server } from 'socket.io';
const http = require('http');
const express = require('express');
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from '@gather/socket-events';

const app = express();
const httpServer = http.createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: { origin: '*' },
});

module.exports = { app, httpServer, io };
