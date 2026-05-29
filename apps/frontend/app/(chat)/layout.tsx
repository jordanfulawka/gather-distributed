'use client';

import Sidebar from '@/components/Sidebar';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='min-h-screen flex'>
      <div>
        <Sidebar />
      </div>
      <div className='flex-1'>{children}</div>
    </div>
  );
}
