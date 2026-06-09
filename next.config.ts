import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'fci49uk9.us-west.insforge.app' },
      { protocol: 'https', hostname: 'placehold.co' },
    ],
  },
}

export default nextConfig
