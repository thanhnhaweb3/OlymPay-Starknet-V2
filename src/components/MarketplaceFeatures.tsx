import { 
  CurrencyDollarIcon, 
  BanknotesIcon, 
  ArrowsUpDownIcon, 
  ShieldCheckIcon,
  ChartBarIcon 
} from '@heroicons/react/24/outline'

const MarketplaceFeatures = () => {
  const features = [
    {
      icon: CurrencyDollarIcon,
      title: 'USDC Trading',
      description: 'USD-pegged stablecoin with 6 decimals precision',
      color: 'text-blue-500'
    },
    {
      icon: BanknotesIcon,
      title: 'US T-Bills',
      description: 'Spiko US T-Bills with 18 decimals for yield farming',
      color: 'text-green-500'
    },
    {
      icon: ArrowsUpDownIcon,
      title: 'Token Swaps',
      description: 'Seamless token exchange with real-time rates',
      color: 'text-primary'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Secure Wallets',
      description: 'Traavos and Argent X wallet integration',
      color: 'text-secondary'
    },
    {
      icon: ChartBarIcon,
      title: 'Real-time Balance',
      description: 'Live balance tracking for all supported tokens',
      color: 'text-warning'
    }
  ]

  return (
    <section className="py-20 bg-base-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl sm:text-6xl font-bold text-base-content mb-4">
            Marketplace Features
          </h2>
          <p className="text-xl text-base-content/70 max-w-2xl mx-auto">
            Advanced trading tools and secure wallet integration for the next generation of DeFi
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <div
                key={index}
                className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-base-300"
              >
                <div className="card-body text-center p-6">
                  <div className={`mx-auto mb-4 p-4 rounded-full bg-base-200 ${feature.color}`}>
                    <IconComponent className="h-8 w-8" />
                  </div>
                  <h3 className="card-title text-xl font-semibold text-base-content mb-2 justify-center">
                    {feature.title}
                  </h3>
                  <p className="text-base-content/70 text-lg">
                    {feature.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default MarketplaceFeatures
