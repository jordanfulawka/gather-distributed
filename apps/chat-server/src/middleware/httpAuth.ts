const jwt = require('jsonwebtoken');
import type { Request, Response, NextFunction } from 'express';

function httpAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(500).json({ error: 'Invalid token' });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ error: 'JWT_SECRET not set' });
  }

  try {
    const decoded = jwt.verify(token, secret);
    (req as any).user = decoded;
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
}

module.exports = { httpAuth };
