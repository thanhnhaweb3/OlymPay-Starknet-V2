'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()

  const navigationItems = [
    { name: 'Home', path: '/' },
    { name: 'On-Ramp', path: '/onramp' },
    { name: 'Marketplace', path: '/marketplace' },
    { name: 'Balance', path: '/balance' },
    { name: 'About', path: '/about' }
  ]

  const handleNavigation = (path: string) => {
    router.push(path)
    setIsMenuOpen(false)
  }

  return (
    <header className="bg-base-100 border-b border-base-300">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => handleNavigation('/')}>
              <img 
                src="/logo.png" 
                alt="Olympay Logo" 
                className="w-10 h-10 mr-3"
                onError={(e) => {
                  // Fallback to text logo if image fails to load
                  e.currentTarget.style.display = 'none'
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement
                  if (fallback) {
                    fallback.style.display = 'flex'
                  }
                }}
              />
              <div className="w-10 h-10 bg-primary rounded-full items-center justify-center mr-3 hidden">
                <span className="text-base-100 font-bold text-lg">O</span>
              </div>
              <span className="text-3xl font-bold text-base-content">Olympay</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navigationItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.path)}
                  className="text-base-content hover:text-primary px-3 py-2 rounded-md text-lg font-medium transition-colors duration-200"
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* Launch App Button */}
          <div className="hidden md:block">
            <button className="bg-primary hover:bg-primary/90 text-base-100 px-6 py-2 rounded-lg font-medium text-lg transition-colors duration-200">
              Launch App
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-base-content hover:text-primary p-2"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-base-200 rounded-lg mt-2">
              {navigationItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.path)}
                  className="text-base-content hover:text-primary block px-3 py-2 rounded-md text-xl font-medium w-full text-left transition-colors duration-200"
                >
                  {item.name}
                </button>
              ))}
              <button className="bg-primary hover:bg-primary/90 text-base-100 px-3 py-2 rounded-md text-xl font-medium w-full mt-4 transition-colors duration-200">
                Launch App
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}

export default Header
