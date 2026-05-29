import { Message, Room } from '@gather/shared-types';
async function login(
  email: string,
  password: string,
): Promise<{ token: string }> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    },
  );
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error);
  }
  return response.json();
}

async function register(
  email: string,
  username: string,
  password: string,
): Promise<{ token: string }> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password }),
    },
  );
  console.log('here');
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error);
  }
  return response.json();
}

async function createRoom(
  name: string,
  token: string,
): Promise<{ newRoom: Room }> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rooms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error);
  }
  return response.json();
}

async function getMessages(
  roomId: string,
  token: string,
): Promise<{ messages: Message[] }> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/rooms/${roomId}/messages`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  );
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error);
  }
  return response.json();
}

async function joinRoom(
  inviteCode: string,
  token: string,
): Promise<{ room: Room }> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/rooms/join`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ inviteCode }),
    },
  );
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error);
  }
  return response.json();
}

async function getRooms(token: string): Promise<{ rooms: Room[] }> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rooms`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error);
  }
  return response.json();
}

async function getRoom(roomId: string, token: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/rooms/${roomId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  if (!response.ok) throw new Error('Could not fetch room');
  return response.json();
}

export {
  login,
  register,
  createRoom,
  getMessages,
  joinRoom,
  getRooms,
  getRoom,
};
