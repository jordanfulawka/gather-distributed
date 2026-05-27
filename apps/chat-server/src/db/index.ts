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
    'INSERT INTO users(username, email, password_hash) VALUES($1, $2, $3) RETURNING *';
  const values = [username, email, hashedPassword];

  const result = await pool.query(text, values);
  return result.rows[0];
}

async function findUserByEmail(
  email: string,
): Promise<User & { password_hash: string }> {
  const text = 'SELECT * FROM users WHERE email = $1';
  const values = [email];

  const result = await pool.query(text, values);
  return result.rows[0];
}

async function createRoom(name: string, ownerId: string): Promise<Room> {
  const inviteCode = randomBytes(4).toString('hex');
  const text =
    'INSERT INTO rooms(name, invite_code, owner_id) VALUES($1, $2, $3) RETURNING *';
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
    'INSERT INTO messages(room_id, user_id, content) VALUES($1, $2, $3) RETURNING *';
  const values = [roomId, userId, content];

  const result = await pool.query(text, values);
  return result.rows[0];
}

export { createUser, findUserByEmail, createRoom, createMessage };
