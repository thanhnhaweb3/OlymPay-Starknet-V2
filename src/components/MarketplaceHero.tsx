const MarketplaceHero = () => {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-base-100 to-base-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Main Headline */}
        <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
          <span className="text-primary">Olympay</span>{' '}
          <span className="text-secondary">Marketplace</span>
        </h1>

        {/* Subheading */}
        <p className="text-xl sm:text-2xl text-base-content/70 mb-12 max-w-3xl mx-auto leading-relaxed">
          Trade USDC and Spiko US T-Bills seamlessly with real-time balance tracking, 
          secure wallet integration, and advanced swap functionality.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button className="bg-primary hover:bg-primary/90 text-base-100 px-8 py-4 rounded-lg font-semibold text-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl">
            Connect Wallet
          </button>
          
          <button className="bg-secondary hover:bg-secondary/90 text-base-100 px-8 py-4 rounded-lg font-semibold text-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl">
            View Balance
          </button>
          
          <button className="border-2 border-primary text-primary hover:bg-primary hover:text-base-100 px-8 py-4 rounded-lg font-semibold text-xl transition-all duration-200 transform hover:scale-105">
            Start Trading
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-lg text-base-content/60">
          <p>Secure • Fast • Reliable</p>
        </div>
      </div>
    </section>
  )
}

export default MarketplaceHero
