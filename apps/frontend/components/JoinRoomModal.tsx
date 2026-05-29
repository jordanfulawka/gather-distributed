'use client';

import { useAuth } from '@/context/AuthContext';
import { joinRoom } from '@/lib/api';
import { useState } from 'react';

export default function JoinRoomModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (roomId: string) => void;
}) {
  const [inviteCode, setInviteCode] = useState('');
  const { token } = useAuth();
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (!token) {
        setError('No token provided');
        return;
      }
      const response = await joinRoom(inviteCode, token);
      onSuccess(response.room.id);
    } catch {
      setError('There was an error');
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
            <label>Invite Code</label>
            <input
              type='text'
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className='border border-black'
            />
            <button
              className='bg-fuchsia-500 rounded-lg w-full mt-3'
              type='submit'
            >
              <p className='p-1'>Join</p>
            </button>
          </form>
        </div>
        {error && <p className='text-red-600'>{error}</p>}
      </div>
    </div>
  );
}
