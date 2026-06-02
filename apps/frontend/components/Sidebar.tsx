'use client';

import { useAuth } from '@/context/AuthContext';
import { getRooms } from '@/lib/api';
import { Room } from '@gather/shared-types';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import CreateRoomModal from './CreateRoomModal';
import JoinRoomModal from './JoinRoomModal';
import Link from 'next/link';
import path from 'path';

export default function Sidebar() {
  const { token, logout } = useAuth();
  const [rooms, setRooms] = useState<Room[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  async function fetchRooms() {
    try {
      if (!token) {
        setError('No token provided');
        return;
      }
      const response = await getRooms(token);
      console.log('test');
      console.log(response.rooms);
      setRooms(response.rooms);
    } catch {
      setError('Error');
    }
  }

  useEffect(() => {
    fetchRooms();
  }, [token]);

  return (
    <div className='h-full bg-black/90 w-64 flex flex-col justify-between'>
      <div className='flex flex-col'>
        <h1
          className='text-white text-2xl p-5 text-center cursor-pointer'
          onClick={() => router.push('/rooms')}
        >
          gather
        </h1>
        <div className='flex flex-col'>
          {rooms?.map((room) => (
            <Link key={room.id} href={`/rooms/${room.id}`}>
              <div
                className={`text-gray-300 hover:bg-white/10 hover:text-white px-4 py-2 rounded-md mx-2 transition-colors
              cursor-pointer `}
              >
                {pathname === `/rooms/${room.id}` ? '> # ' : '# '}
                {room.name}
              </div>
            </Link>
          ))}
        </div>
      </div>
      {showCreateModal && (
        <CreateRoomModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={(roomId: string) => {
            fetchRooms();
            router.push(`/rooms/${roomId}`);
          }}
        />
      )}
      {showJoinModal && (
        <JoinRoomModal
          onClose={() => setShowJoinModal(false)}
          onSuccess={(roomId: string) => {
            fetchRooms();
            router.push(`/rooms/${roomId}`);
          }}
        />
      )}
      <div className='p-5 flex flex-col justify-center gap-5'>
        <button
          // className='bg-green-500 rounded-lg w-full'
          className='border border-white text-white hover:bg-white hover:text-black transition-colors rounded-lg w-full p-1'
          onClick={() => setShowCreateModal(true)}
        >
          <p className='p-1'>create room</p>
        </button>
        <button
          className='border border-white text-white hover:bg-white hover:text-black transition-colors rounded-lg w-full p-1'
          onClick={() => setShowJoinModal(true)}
        >
          <p className='p-1'>join room</p>
        </button>
        <button
          className='border border-red-400 text-red-400 hover:bg-red-400 hover:text-black transition-colors rounded-lg w-full p-1'
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
