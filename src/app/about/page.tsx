import Header from '@/components/Header'
import Footer from '@/components/Footer'

const AboutPage = () => {
  return (
    <main className="min-h-screen bg-base-100">
      <Header />
      
      <section className="py-16 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl sm:text-6xl font-bold mb-6 leading-tight">
              <span className="text-primary">About</span>{' '}
              <span className="text-secondary">Olympay</span>
            </h1>
            <p className="text-xl text-base-content/70 max-w-2xl mx-auto mb-12">
              Revolutionizing the future of decentralized finance with cutting-edge 
              StableCoin infrastructure and seamless cross-chain solutions.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6 text-base-content">
                  Our Mission
                </h2>
                <p className="text-lg text-base-content/70 mb-6">
                  Olympay is building the next generation of decentralized finance infrastructure, 
                  focusing on stablecoin solutions that bridge traditional finance with the 
                  blockchain ecosystem.
                </p>
                <p className="text-lg text-base-content/70">
                  We provide seamless on-ramp and off-ramp services, cross-chain transfers, 
                  and real-world asset tokenization to make DeFi accessible to everyone.
                </p>
              </div>
              
              <div className="bg-base-200 rounded-2xl p-8">
                <h3 className="text-2xl font-bold mb-4 text-primary">Key Features</h3>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                    <span>StableCoin Infrastructure</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-secondary rounded-full mr-3"></div>
                    <span>Cross-Chain Transfers</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-accent rounded-full mr-3"></div>
                    <span>Real-World Asset Tokenization</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                    <span>Seamless On/Off-Ramp</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-base-200">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8 text-base-content">
              Built on Starknet
            </h2>
            <p className="text-lg text-base-content/70 mb-8">
              Olympay leverages Starknet's cutting-edge zero-knowledge proof technology 
              to provide fast, secure, and cost-effective transactions while maintaining 
              the security of Ethereum.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-base-100 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-3 text-primary">Fast</h3>
                <p className="text-base-content/70">
                  Lightning-fast transactions with instant finality
                </p>
              </div>
              <div className="bg-base-100 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-3 text-secondary">Secure</h3>
                <p className="text-base-content/70">
                  Ethereum-level security with zero-knowledge proofs
                </p>
              </div>
              <div className="bg-base-100 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-3 text-accent">Cost-Effective</h3>
                <p className="text-base-content/70">
                  Low transaction fees for all operations
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </main>
  )
}

export default AboutPage
