import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import StarknetProvider from '@/components/StarknetProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Olympay - Growth Stablecoin on Starknet',
  description: 'Revolutionary StableCoin payment infrastructure with seamless on-ramp, off-ramp, CCIP cross-chain transfers, and RWA tokenization',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'Olympay - Growth Stablecoin on Starknet',
    description: 'Revolutionary StableCoin payment infrastructure with seamless on-ramp, off-ramp, CCIP cross-chain transfers, and RWA tokenization',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Olympay - Growth Stablecoin on Starknet',
    description: 'Revolutionary StableCoin payment infrastructure with seamless on-ramp, off-ramp, CCIP cross-chain transfers, and RWA tokenization',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-theme="dark">
      <body className={inter.className}>
        <StarknetProvider>
          {children}
        </StarknetProvider>
      </body>
    </html>
  )
}
