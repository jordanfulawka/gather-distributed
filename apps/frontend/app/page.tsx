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
    <div className='bg-black fixed inset-0 flex justify-evenly items-center z-50'>
      <div className='text-white text-9xl'>
        gather.<span className='animate-blink'>_</span>
      </div>
      <div className='w-96 rounded-2xl'>
        <div className='p-4'>
          <form
            onSubmit={handleSubmit}
            className='flex flex-col text-white h-64'
          >
            <div className='flex flex-col'>
              <label>{'> '}email</label>
              <input
                type='text'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='border border-white w-full py-2 px-3'
              />
            </div>
            <div
              className={`overflow-clip transition-all duration-300 ${mode == 'register' ? 'max-h-24' : 'max-h-0'}`}
            >
              <div className='flex flex-col overflow-visible'>
                <label>{'> '}username</label>
                <input
                  type='text'
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className='border border-white w-full py-2 px-3 outline-none focus:border-white'
                  tabIndex={mode === 'register' ? 0 : -1}
                />
              </div>
            </div>

            <div className='flex flex-col'>
              <label>{'> '}password</label>
              <input
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='border border-white w-full py-2 px-3'
              />
            </div>
            <div className='text-white'>
              {mode === 'login' && (
                <p
                  onClick={() => {
                    setMode('register');
                    clearFields();
                  }}
                  className='text-sm cursor-pointer'
                >
                  $ no account? register
                </p>
              )}
              {mode === 'register' && (
                <p
                  onClick={() => {
                    setMode('login');
                    clearFields();
                  }}
                  className='text-sm cursor-pointer'
                >
                  $ already signed up? login
                </p>
              )}
              {error && <p>{error}</p>}
            </div>
            <button type='submit' className='mt-auto'>
              {mode === 'login' ? 'login' : 'register'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
