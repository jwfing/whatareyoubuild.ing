import type { Metadata } from 'next'
import { Fraunces, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import PostHogProvider from '@/components/PostHogProvider'

const serif = Fraunces({ subsets: ['latin'], variable: '--font-serif', weight: ['400', '600', '800'] })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', weight: ['400', '700'] })

export const metadata: Metadata = {
  title: 'What Are You Building',
  description: 'A showcase of what vibe coders are building. Post yours, upvote others.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${mono.variable}`}>
      <body><PostHogProvider>{children}</PostHogProvider></body>
    </html>
  )
}
