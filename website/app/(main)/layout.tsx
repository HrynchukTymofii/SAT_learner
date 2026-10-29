'use client'

import { SessionProvider } from 'next-auth/react'
import React from 'react'
import ToasterProvider from '@/components/toaster-provider'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'

// Marketing site: black frame (header + footer) around a light, rounded panel
const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <ToasterProvider />
      <div className="min-h-screen bg-frame">
        <SiteHeader />
        <div className="mx-auto min-h-[60vh] max-w-[1360px] overflow-x-clip rounded-t-[28px] bg-background pb-24 sm:rounded-t-[40px]">
          <main className="mx-auto w-full max-w-6xl px-4 sm:px-6">{children}</main>
        </div>
        <SiteFooter />
      </div>
    </SessionProvider>
  )
}

export default MainLayout
