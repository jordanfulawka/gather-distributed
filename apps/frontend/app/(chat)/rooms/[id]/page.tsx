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
  const ref = useRef<HTMLDivElement>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
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
      console.log(roomData);
      setMessages(messages.messages);
      setRoom(roomData.room);
    } catch {
      setError('Error fetching messages');
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    socket.emit('messages:send', {
      roomId: roomId,
      content: text,
    });
    setText('');
  }

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!token) return;
    socket.auth = { token };
    socket.connect();
    socket.on('connect', () => {
      socket.emit('room:join', roomId);
      heartbeatRef.current = setInterval(() => {
        socket.emit('presence:ping', roomId);
      }, 20000);
    });
    socket.on('message:received', (message) => {
      setMessages((prev) => (prev ? [...prev, message] : [message]));
    });
    fetchMessagesAndRoomData();

    return () => {
      socket.off('connect');
      socket.off('message:received');
      socket.disconnect();
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, [token]);

  return (
    <div className='bg-black/80 flex flex-col h-full'>
      <div className='flex items-center justify-between px-6 py-3 border-b border-white/10 bg-black/60'>
        <h2 className='text-white font-semibold text-lg'># {room?.name}</h2>
        <div className='flex items-center gap-2 text-gray-400 text-sm'>
          <span>invite code:</span>
          <span className='bg-white/10 px-2 py-1 rounded font-mono text-white'>
            {room?.inviteCode}
          </span>
        </div>
      </div>
      <div className='flex flex-col flex-1 overflow-y-auto'>
        {messages?.map((message) => {
          return (
            <div key={message.id}>
              <span>{message.username}: </span>
              <span>{message.content}</span>
            </div>
          );
        })}
        <div ref={ref} />
      </div>
      <div className='shrink-0'>
        <form onSubmit={handleSubmit}>
          <input
            type='text'
            value={text}
            onChange={(e) => setText(e.target.value)}
            className='border border-black'
          />
        </form>
      </div>
    </div>
  );
}
