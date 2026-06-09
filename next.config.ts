import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'fci49uk9.us-west.insforge.app' },
      { protocol: 'https', hostname: 'placehold.co' }, // seed/demo placeholder images — remove before public launch
    ],
  },
}

export default nextConfig
