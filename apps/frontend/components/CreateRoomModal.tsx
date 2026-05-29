'use client';

import { useAuth } from '@/context/AuthContext';
import { createRoom } from '@/lib/api';
import { Room } from '@gather/shared-types';
import { useState } from 'react';

export default function CreateRoomModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (roomId: string) => void;
}) {
  const [roomName, setRoomName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const { token } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (!token) {
        setError('No token provided');
        return;
      }
      const response = await createRoom(roomName, token);
      setRoom(response.newRoom);
      setInviteCode(response.newRoom.inviteCode);
    } catch {
      setError('Error');
    }
  }

  return (
    <div
      className='bg-black/50 fixed inset-0 flex justify-center items-center z-50'
      onClick={onClose}
    >
      <div
        className='bg-white w-96 rounded-2xl'
        onClick={(e) => e.stopPropagation()}
      >
        <div className='p-4'>
          <form className='flex flex-col' onSubmit={handleSubmit}>
            <label>Room Name</label>
            <input
              type='text'
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className='border border-black'
            />
            {!inviteCode && (
              <div className='flex justify-around gap-5 mt-3'>
                <button
                  className='bg-gray-500 rounded-lg w-full'
                  onClick={onClose}
                  type='button'
                >
                  <p className='p-1'>Cancel</p>
                </button>
                <button
                  className='bg-green-500 rounded-lg w-full'
                  onClick={handleSubmit}
                  type='submit'
                >
                  <p className='p-1'>Create</p>
                </button>
              </div>
            )}
            {inviteCode && <p>Invite Code: {inviteCode}</p>}
            {inviteCode && (
              <button
                className='bg-fuchsia-500 rounded-lg w-full'
                onClick={() => room && onSuccess(room.id)}
                type='button'
              >
                <p className='p-1'>Done</p>
              </button>
            )}
          </form>
          {error && <p className='text-red-600'>{error}</p>}
        </div>
      </div>
    </div>
  );
}
