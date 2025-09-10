import { 
  CurrencyDollarIcon, 
  ArrowsRightLeftIcon, 
  LinkIcon, 
  BuildingOfficeIcon,
  BanknotesIcon 
} from '@heroicons/react/24/outline'

const Features = () => {
  const features = [
    {
      icon: CurrencyDollarIcon,
      title: 'StableCoin',
      description: 'USD-pegged stability',
      color: 'text-primary'
    },
    {
      icon: ArrowsRightLeftIcon,
      title: 'On/Off Ramp',
      description: 'Fiat to crypto bridge',
      color: 'text-secondary'
    },
    {
      icon: LinkIcon,
      title: 'CCIP',
      description: 'Cross-chain transfers',
      color: 'text-primary'
    },
    {
      icon: BuildingOfficeIcon,
      title: 'RWA',
      description: 'Real-world assets',
      color: 'text-secondary'
    },
    {
      icon: BanknotesIcon,
      title: 'Earning',
      description: 'Automated yield farming',
      color: 'text-primary'
    }
  ]

  return (
    <section className="py-20 bg-base-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl sm:text-6xl font-bold text-base-content mb-4">
            Our Core Features
          </h2>
          <p className="text-xl text-base-content/70 max-w-2xl mx-auto">
            Comprehensive solutions for the next generation of digital payments
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

export default Features
