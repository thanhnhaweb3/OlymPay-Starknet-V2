'use client'

import dynamic from 'next/dynamic'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

// Dynamically import DebitCardContent to avoid SSR issues
const DebitCardContent = dynamic(() => import('@/components/DebitCardContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="loading loading-spinner loading-lg"></div>
    </div>
  )
})

export default function DebitCardPage() {
  return (
    <div className="min-h-screen bg-base-200">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <DebitCardContent />
      </main>
      <Footer />
    </div>
  )
}
