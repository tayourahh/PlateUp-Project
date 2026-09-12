// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // Optimasi gambar otomatis Next.js dimatikan — untuk project skala kecil
    // seperti ini, kompleksitas & potensi error dari image optimizer server-side
    // tidak sepadan dengan manfaatnya. <Image> akan berlaku seperti <img> biasa.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
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