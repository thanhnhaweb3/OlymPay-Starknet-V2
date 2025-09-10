import dynamic from 'next/dynamic'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

// Dynamically import the component to prevent SSR issues with Starknet hooks
const OnRampContent = dynamic(() => import('@/components/OnRampContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 py-16 flex items-center justify-center">
      <div className="text-center">
        <span className="loading loading-spinner loading-lg"></span>
        <p className="mt-4 text-base-content/70">Loading On-Ramp...</p>
      </div>
    </div>
  )
})

const OnRampPage = () => {
  return (
    <main className="min-h-screen bg-base-100">
      <Header />
      <OnRampContent />
      <Footer />
    </main>
  )
}

export default OnRampPage