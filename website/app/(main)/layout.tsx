'use client'

import { Navbar } from '@/components/navbar';
import { SessionProvider } from 'next-auth/react';
import React, { Suspense } from 'react'

const MainLayout =  ({ children }: { children: React.ReactNode;}) => {
  return (
    <SessionProvider>
    <div className='max-w-7xl'>
      <Suspense fallback={null}>
        <Navbar />
      </Suspense>
      <main className='flex justify-center h-full'>
        {children}
      </main>
    </div>
    </SessionProvider>
  )
}

export default MainLayout
