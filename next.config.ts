import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // Product images are user content (uploads, or any image URL). Two things
    // make next/image throw/400 on otherwise-valid images:
    //  1. an unlisted host  -> allow any HTTPS host.
    //  2. an SVG source     -> the optimizer rejects SVG by default; allow it,
    //     served with attachment disposition + a sandbox CSP per Next's docs so
    //     a malicious SVG can't execute as same-origin.
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
}

export default nextConfig
