// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Foto produk yang di-upload partner disimpan di Supabase Storage
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        // Placeholder untuk data demo (boleh dihapus kalau nanti semua
        // produk sudah pakai foto asli)
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