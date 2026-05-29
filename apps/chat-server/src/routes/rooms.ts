import {
  addRoomMember,
  createRoom,
  findRoomByInviteCode,
  getMessagesByRoomId,
  getRoomById,
  getRoomsByUserId,
} from '../db';
import type { Request, Response } from 'express';
const { httpAuth } = require('../middleware/httpAuth');

const express = require('express');

const router = express.Router();

router.route('/').get(httpAuth, async (req: Request, res: Response) => {
  try {
    const rooms = await getRoomsByUserId((req as any).user.id);
    res.status(200).json({ rooms });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch rooms' });
  }
});

router.route('/').post(httpAuth, async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const newRoom = await createRoom(name, (req as any).user.id);
    await addRoomMember(newRoom.id, (req as any).user.id);
    res.status(201).json({ newRoom });
  } catch (err) {
    res.status(500).json({ error: 'Room could not be created' });
  }
});

router
  .route('/:id')
  .get(httpAuth, async (req: Request<{ id: string }>, res: Response) => {
    try {
      const room = await getRoomById(req.params.id);
      if (!room) return res.status(404).json({ error: 'Room not found' });
      res.status(200).json({ room });
    } catch (err) {
      res.status(500).json({ error: 'Could not fetch room' });
    }
  });

router
  .route('/:id/messages')
  .get(httpAuth, async (req: Request<{ id: string }>, res: Response) => {
    try {
      const id = req.params.id;
      if (!id) {
        return res.status(400).json({ error: 'Room ID required' });
      }
      const messages = await getMessagesByRoomId(id);
      res.status(200).json({ messages });
    } catch (err) {
      res.status(500).json({ error: 'Could not fetch messages' });
    }
  });

router.route('/join').post(httpAuth, async (req: Request, res: Response) => {
  try {
    const { inviteCode } = req.body;
    if (!inviteCode) {
      return res.status(400).json({ error: 'Invite code required' });
    }

    const room = await findRoomByInviteCode(inviteCode);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    await addRoomMember(room.id, (req as any).user.id);

    res.status(200).json({ room });
  } catch (err) {
    res.status(500).json({ error: 'Could not find room' });
  }
});

module.exports = { roomsRouter: router };
