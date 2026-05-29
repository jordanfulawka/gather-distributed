'use client';

import { useAuth } from '@/context/AuthContext';
import { getRooms } from '@/lib/api';
import { Room } from '@gather/shared-types';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import CreateRoomModal from './CreateRoomModal';
import JoinRoomModal from './JoinRoomModal';

export default function Sidebar() {
  const { token, logout } = useAuth();
  const [rooms, setRooms] = useState<Room[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  const router = useRouter();

  useEffect(() => {
    async function fetchRooms() {
      try {
        if (!token) {
          setError('No token provided');
          return;
        }
        const response = await getRooms(token);
        setRooms(response.rooms);
      } catch {
        setError('Error');
      }
    }
    fetchRooms();
  }, []);

  return (
    <div className='h-full bg-black/90 w-64 flex flex-col justify-between'>
      <div className='flex justify-center'>
        <h1 className='text-white text-2xl p-5'>gather</h1>
      </div>
      <div>
        {rooms?.map((room) => (
          <div key={room.id}>{room.name}</div>
        ))}
      </div>
      {showCreateModal && (
        <CreateRoomModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={(roomId: string) => {
            router.push(`/rooms/${roomId}`);
          }}
        />
      )}
      {showJoinModal && (
        <JoinRoomModal
          onClose={() => setShowJoinModal(false)}
          onSuccess={(roomId: string) => {
            router.push(`/rooms/${roomId}`);
          }}
        />
      )}
      <div className='p-5 flex flex-col justify-center gap-5'>
        <button
          className='bg-green-500 rounded-lg w-full'
          onClick={() => setShowCreateModal(true)}
        >
          <p className='p-1'>create room</p>
        </button>
        <button
          className='bg-fuchsia-500 rounded-lg w-full'
          onClick={() => setShowJoinModal(true)}
        >
          <p className='p-1'>join room</p>
        </button>
        <button
          className='bg-gray-700 rounded-lg w-full'
          onClick={() => {
            logout();
            router.push('/');
          }}
        >
          <p className='p-1'>logout</p>
        </button>
      </div>
    </div>
  );
}
