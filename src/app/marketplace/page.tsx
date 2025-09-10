import Header from '@/components/Header'
import MarketplaceHero from '@/components/MarketplaceHero'
import MarketplaceFeatures from '@/components/MarketplaceFeatures'
import Marketplace from '@/components/Marketplace'
import Footer from '@/components/Footer'

export default function MarketplacePage() {
  return (
    <main className="min-h-screen bg-base-100">
      <Header />
      <MarketplaceHero />
      <MarketplaceFeatures />
      <Marketplace />
      <Footer />
    </main>
  )
}
