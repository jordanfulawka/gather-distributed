'use client';

import { useAuth } from '@/context/AuthContext';
import { getMessages, getRoom } from '@/lib/api';
import { socket } from '@/lib/socket';
import { Message, Room } from '@gather/shared-types';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function RoomPage() {
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [text, setText] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<Record<string, string>>({});
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const [isTyping, setIsTyping] = useState(false);

  const ref = useRef<HTMLDivElement>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const hasConnectedRef = useRef(false);
  const messageRef = useRef<Message[] | null>(null);
  const isMountedRef = useRef(false);

  const { token } = useAuth();
  const { id } = useParams();
  const roomId = id as string;

  async function fetchMessagesAndRoomData() {
    try {
      if (!token) {
        setError('No token provided');
        return;
      }
      const messages = await getMessages(roomId, token);
      const roomData = await getRoom(roomId, token);
      setMessages(messages.messages);
      setRoom(roomData.room);
    } catch {
      setError('Error fetching messages');
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const uuid = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
    socket.emit('messages:send', {
      roomId: roomId,
      content: text,
      eventId: uuid,
    });
    setText('');
    setIsTyping(false);
  }

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
    messageRef.current = messages;
  }, [messages]);

  useEffect(() => {
    if (!token) return;
    socket.auth = { token };
    socket.connect();
    socket.on('connect', () => {
      if (hasConnectedRef.current) {
        const lastMessageId = messageRef.current?.at(-1)?.id ?? null;
        socket.emit('room:rejoin', { roomId, lastMessageId });
      } else {
        hasConnectedRef.current = true;
        socket.emit('room:join', roomId);
        heartbeatRef.current = setInterval(() => {
          socket.emit('presence:ping', roomId);
        }, 20000);
      }
    });
    socket.on('message:received', (message) => {
      setMessages((prev) => (prev ? [...prev, message] : [message]));
    });
    socket.on('presence:update', (presence: Record<string, string>) => {
      setOnlineUsers(presence);
    });
    socket.on('typing:update', (user) => {
      setTypingUsers((prev) => ({ ...prev, [user.username]: user.isTyping }));
    });

    fetchMessagesAndRoomData();

    return () => {
      socket.emit('room:leave', roomId);
      socket.off('connect');
      socket.off('message:received');
      socket.off('presence:update');
      socket.off('typing:update');
      socket.disconnect();
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, [token]);

  useEffect(() => {
    const timerId = setTimeout(() => setIsTyping(false), 5000);
    return () => clearTimeout(timerId);
  }, [text]);

  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }
    if (isTyping) {
      socket.emit('typing:start', roomId);
    } else {
      socket.emit('typing:stop', roomId);
    }
  }, [isTyping]);

  return (
    <div className='bg-black/80 flex flex-col h-full'>
      <div className='flex items-center justify-between px-6 py-3 border-b border-white/10 bg-black/60'>
        <div className='relative group'>
          <h2 className='text-white font-semibold text-lg cursor-default'>
            # {room?.name}
          </h2>
          <div className='absolute top-full left-0 mg-1 bg-black/90 border border-white/10 rounded p-2 hidden group-hover:block z-10 min-w-32'>
            <p className='text-gray-400 text-xs mb-1'>Online</p>
            {Object.keys(onlineUsers).map((username) => (
              <p key={username} className='text-white text-sm'>
                {username}
              </p>
            ))}
          </div>
        </div>
        <div className='flex items-center gap-2 text-gray-400 text-sm'>
          <span>invite code:</span>
          <span className='bg-white/10 px-2 py-1 rounded font-mono text-white'>
            {room?.inviteCode}
          </span>
        </div>
      </div>
      <div className='flex flex-col flex-1 overflow-y-auto px-4 py-2 gap-1'>
        {messages?.map((message) => {
          return (
            <div key={message.id} className='font-mono text-sm leading-relaxed'>
              <span className='text-green-400'>{message.username}</span>
              <span className='text-gray-500'>: </span>
              <span className='text-gray-200'>{message.content}</span>
            </div>
          );
        })}
        <div ref={ref} />
      </div>
      <div className='shrink-0 border-t border-white/10 bg-black/60'>
        <div className='px-4 py-1 h-5 text-gray-500 text-xs italic'>
          {Object.entries(typingUsers)
            .filter(([, isTyping]) => isTyping)
            .map(([username]) => username)
            .join(', ')}
          {Object.values(typingUsers).some(Boolean) && ' is typing...'}
        </div>
        <form onSubmit={handleSubmit} className='flex items-center gap-2 px-4 py-3'>
          <span className='text-green-400 font-mono text-sm select-none'>{'>'}</span>
          <input
            type='text'
            value={text}
            onChange={(e) => {
              setIsTyping(true);
              setText(e.target.value);
            }}
            placeholder='type a message...'
            className='flex-1 bg-transparent text-white font-mono text-sm outline-none placeholder-gray-600 caret-green-400'
          />
        </form>
      </div>
    </div>
  );
}
