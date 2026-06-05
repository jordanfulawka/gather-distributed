import express, { Request, Response } from 'express';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createUser, findUserByEmail } from '../db';

const router = express.Router();

router.route('/register').post(async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body;
    const hashedPassword = await bcryptjs.hash(password, 10);
    const newUser = await createUser(username, email, hashedPassword);

    if (!process.env.JWT_SECRET)
      return res.status(500).json({ error: 'Server misconfiguration' });

    const token = jwt.sign(
      {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
    );

    res.status(201).json({ token });
  } catch (err: any) {
    if (err.code === '23505') {
      if (err.detail?.includes('email')) {
        return res.status(409).json({ error: 'Email is already in use' });
      }
      if (err.detail?.includes('username')) {
        return res.status(409).json({ error: 'Username is already in use' });
      }
    }
    console.error(err);
    res.status(500).json({ error: 'Registration Failed' });
  }
});

router.route('/login').post(async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const passwordMatch = await bcryptjs.compare(password, user.passwordHash);

    if (!process.env.JWT_SECRET)
      return res.status(500).json({ error: 'Server misconfiguration' });

    if (passwordMatch) {
      const token = jwt.sign(
        { id: user.id, username: user.username, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' },
      );
      res.status(200).json({ token });
    } else {
      res.status(401).json({ error: 'Invalid Credentials' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = { authRouter: router };
