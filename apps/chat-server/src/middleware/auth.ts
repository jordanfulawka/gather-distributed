const jwt = require('jsonwebtoken');
import type { Socket } from 'socket.io';

function authMiddleware(socket: Socket, next: (err?: Error) => void) {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('No token provided'));
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not set');

  try {
    const decoded = jwt.verify(token, secret);
    socket.data.user = decoded;
  } catch (err) {
    return next(new Error('Invalid token'));
  }

  next();
}

module.exports = { authMiddleware };
