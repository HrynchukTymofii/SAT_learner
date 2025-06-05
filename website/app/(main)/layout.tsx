import { Navbar } from '@/components/navbar';
import React, { Suspense } from 'react'

const MainLayout = async ({ children }: { children: React.ReactNode;}) => {
  return (
    <div className='max-w-7xl'>
      <Suspense fallback={null}>
        <Navbar />
      </Suspense>
      <main className='flex justify-center h-full'>
        {children}
      </main>
    </div>
  )
}

export default MainLayout
