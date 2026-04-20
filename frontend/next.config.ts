// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',       // URL yang dipanggil frontend
        destination: 'http://127.0.0.1:5000/api/:path*', // Forward ke Flask
      },
    ]
  },
}

export default nextConfig