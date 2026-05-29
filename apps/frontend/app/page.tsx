'use client';

import { useState } from 'react';
import { login as apiLogin, register as apiRegister } from '../lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const { login } = useAuth();

  function clearFields() {
    setEmail('');
    setPassword('');
    setUsername('');
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === 'login') {
      try {
        setLoading(true);
        const { token } = await apiLogin(email, password);
        login(token);
        router.push('/rooms');
      } catch (err) {
        setError('There was an error logging you in');
      } finally {
        setLoading(false);
      }
    } else {
      try {
        setLoading(true);
        const { token } = await apiRegister(email, username, password);
        login(token);
        router.push('/rooms');
      } catch (err) {
        setError('There was an error registering you account');
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <div className='bg-black/80 fixed inset-0 flex justify-center items-center z-50'>
      <div className='bg-white w-96 rounded-2xl'>
        <div className='p-4'>
          <form onSubmit={handleSubmit} className='flex flex-col'>
            <label>Email</label>
            <input
              type='text'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='border border-black'
            />
            {mode === 'register' && (
              <>
                <label>Username</label>
                <input
                  type='text'
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className='border border-black'
                />
              </>
            )}
            <label>Password</label>
            <input
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='border border-black'
            />
            <button type='submit'>
              {mode === 'login' ? 'Login' : 'Register'}
            </button>
          </form>
          <div>
            {mode === 'login' && (
              <p
                onClick={() => {
                  setMode('register');
                  clearFields();
                }}
              >
                Don't have an account? Click here to Register
              </p>
            )}
            {mode === 'register' && (
              <p
                onClick={() => {
                  setMode('login');
                  clearFields();
                }}
              >
                Already have an account? Click here to Login
              </p>
            )}
            {error && <p>{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
