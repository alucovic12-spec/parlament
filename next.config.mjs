/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  compress: true,
  images: { formats: ['image/avif', 'image/webp'], minimumCacheTTL: 60 * 60 * 24 * 30 },
  experimental: {
    // CV uploads are capped at 5 MB, so the multipart body needs headroom above the 1 MB default.
    serverActions: { bodySizeLimit: '6mb' },
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
}

export default nextConfig
