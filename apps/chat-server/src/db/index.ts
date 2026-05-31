require('dotenv').config();
import type { User, Message, Room } from '@gather/shared-types';
import { Pool } from 'pg';
import { randomBytes } from 'node:crypto';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function createUser(
  username: string,
  email: string,
  hashedPassword: string,
): Promise<User> {
  const text =
    'INSERT INTO users(username, email, password_hash) VALUES($1, $2, $3) RETURNING id, username, email, password_hash AS "passwordHash", created_at AS "createdAt"';
  const values = [username, email, hashedPassword];
  const result = await pool.query(text, values);
  return result.rows[0];
}

async function findUserByEmail(
  email: string,
): Promise<User & { passwordHash: string }> {
  const text =
    'SELECT id, username, email, password_hash AS "passwordHash", created_at AS "createdAt" FROM users WHERE email = $1';
  const values = [email];

  const result = await pool.query(text, values);
  return result.rows[0];
}

async function createRoom(name: string, ownerId: string): Promise<Room> {
  const inviteCode = randomBytes(4).toString('hex');
  const text =
    'INSERT INTO rooms(name, invite_code, owner_id) VALUES($1, $2, $3) RETURNING id, name, invite_code AS "inviteCode", owner_id AS "ownerId", created_at AS "createdAt"';
  const values = [name, inviteCode, ownerId];

  const result = await pool.query(text, values);
  return result.rows[0];
}

async function createMessage(
  roomId: string,
  userId: string,
  content: string,
): Promise<Message> {
  const text =
    'INSERT INTO messages(room_id, user_id, content) VALUES($1, $2, $3) RETURNING id, room_id AS "roomId", user_id AS "userId", content, created_at AS "createdAt"';
  const values = [roomId, userId, content];

  const result = await pool.query(text, values);
  return result.rows[0];
}

async function findRoomByInviteCode(inviteCode: string): Promise<Room> {
  const text =
    'SELECT id, name, invite_code AS "inviteCode", owner_id AS "ownerId", created_at AS "createdAt" FROM rooms WHERE invite_code = $1';
  const values = [inviteCode];

  const result = await pool.query(text, values);
  return result.rows[0];
}

async function getMessagesByRoomId(roomId: string): Promise<Message[]> {
  const text =
    'SELECT messages.id, messages.room_id AS "roomId", messages.user_id AS "userId", users.username, messages.content, messages.created_at AS "createdAt" FROM messages JOIN users ON messages.user_id = users.id WHERE room_id = $1';
  const values = [roomId];

  const result = await pool.query(text, values);
  return result.rows;
}

async function addRoomMember(roomId: string, userId: string): Promise<void> {
  const text = 'INSERT INTO room_members(room_id, user_id) VALUES($1, $2)';
  const values = [roomId, userId];

  await pool.query(text, values);
}

async function getRoomsByUserId(userId: string): Promise<Room[]> {
  const text =
    'SELECT rooms.id, rooms.name, rooms.invite_code AS "inviteCode", rooms.owner_id AS "ownerId", rooms.created_at AS "createdAt" FROM rooms JOIN room_members on rooms.id = room_members.room_id WHERE user_id = $1';
  const values = [userId];

  const result = await pool.query(text, values);
  return result.rows;
}

async function getRoomById(roomId: string): Promise<Room> {
  const text =
    'SELECT id, name, invite_code AS "inviteCode", owner_id AS "ownerId", created_at AS "createdAt" FROM rooms WHERE id = $1';
  const values = [roomId];

  const result = await pool.query(text, values);
  return result.rows[0];
}

async function getMessagesAfter(roomId: string, lastMessageId: string) {
  const text = `
  SELECT messages.id, messages.room_id as "roomId", messages.user_id as "userId", users.username, messages.content, messages.created_at AS "createdAt" 
  FROM messages 
  JOIN users ON messages.user_id = users.id
  WHERE messages.room_id = $1 AND messages.created_at > (SELECT created_at FROM messages WHERE id = $2) ORDER BY messages.created_at ASC`;
  const values = [roomId, lastMessageId];

  const result = await pool.query(text, values);
  return result.rows;
}

export {
  createUser,
  findUserByEmail,
  createRoom,
  createMessage,
  findRoomByInviteCode,
  getMessagesByRoomId,
  addRoomMember,
  getRoomsByUserId,
  getRoomById,
  getMessagesAfter,
};
