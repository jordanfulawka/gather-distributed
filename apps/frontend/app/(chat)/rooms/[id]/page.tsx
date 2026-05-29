'use client';

import { useAuth } from '@/context/AuthContext';
import { getMessages } from '@/lib/api';
import { socket } from '@/lib/socket';
import { Message } from '@gather/shared-types';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function RoomPage() {
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [text, setText] = useState('');
  const { token } = useAuth();
  const { id } = useParams();
  const roomId = id as string;

  async function fetchMessages() {
    try {
      if (!token) {
        setError('No token provided');
        return;
      }
      const messages = await getMessages(roomId, token);
      setMessages(messages.messages);
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
    socket.auth = { token };
    socket.connect();
    socket.emit('room:join', roomId);
    socket.on('message:received', (message) => {
      setMessages((prev) => (prev ? [...prev, message] : [message]));
    });
    fetchMessages();

    return () => {
      socket.off('message:received');
      socket.disconnect();
    };
  }, []);

  return (
    <div className='bg-black/80 h-full flex justify-center items-center'>
      <div className='flex flex-col'>
        {messages?.map((message) => {
          return <span key={message.id}>{message.content}</span>;
        })}
      </div>
      <div>
        <form onSubmit={handleSubmit}>
          <input
            type='text'
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </form>
      </div>
    </div>
  );
}
