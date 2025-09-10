const Footer = () => {
  return (
    <footer className="bg-base-300 border-t border-base-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-3">
                <span className="text-base-100 font-bold text-xl">O</span>
              </div>
              <span className="text-5xl font-bold text-base-content">Olympay</span>
            </div>
            <p className="text-base-content/70 text-xl max-w-md">
              Revolutionary StableCoin payment infrastructure with seamless on-ramp, off-ramp, 
              CCIP cross-chain transfers, and RWA tokenization.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-base-content font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-base-content/70 hover:text-primary text-xl transition-colors">Documentation</a></li>
              <li><a href="#" className="text-base-content/70 hover:text-primary text-xl transition-colors">API Reference</a></li>
              <li><a href="#" className="text-base-content/70 hover:text-primary text-xl transition-colors">Support</a></li>
              <li><a href="#" className="text-base-content/70 hover:text-primary text-xl transition-colors">Community</a></li>
            </ul>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-base-content font-semibold mb-4">Products</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-base-content/70 hover:text-primary text-xl transition-colors">StableCoin</a></li>
              <li><a href="#" className="text-base-content/70 hover:text-primary text-xl transition-colors">On/Off Ramp</a></li>
              <li><a href="#" className="text-base-content/70 hover:text-primary text-xl transition-colors">CCIP</a></li>
              <li><a href="#" className="text-base-content/70 hover:text-primary text-xl transition-colors">RWA</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-base-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-base-content/70 text-xl">
            © 2025 Olympay.Fi All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-base-content/70 hover:text-primary text-xl transition-colors">Privacy Policy</a>
            <a href="#" className="text-base-content/70 hover:text-primary text-xl transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
