import { Message, User } from '@gather/shared-types';

export interface ClientToServerEvents {
  'room:join': (roomId: string) => void;
  'room:leave': (roomId: string) => void;
  'messages:send': (payload: { roomId: string; content: string }) => void;
  'typing:start': (roomId: string) => void;
  'typing:stop': (roomId: string) => void;
}

export interface ServerToClientEvents {
  'message:received': (message: Message) => void;
  'room:user_joined': (user: User) => void;
  'room:user_left': (user: User) => void;
  'presence:update': (users: User[]) => void;
  'typing:update': (payload: {
    userId: string;
    username: string;
    isTyping: boolean;
  }) => void;
}
