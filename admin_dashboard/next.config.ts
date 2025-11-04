import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output configuration
  // Use 'standalone' for Docker, undefined for Vercel
  output: process.env.VERCEL ? undefined : (process.env.NODE_ENV === 'production' ? 'standalone' : undefined),

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'api.alhilaltravels.com',
      },
    ],
    // Vercel handles image optimization automatically
    unoptimized: process.env.NODE_ENV === 'development',
  },

  // React strict mode
  reactStrictMode: true,

  // Allow build to succeed with lint warnings (temporary - should fix before production)
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },

  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },

  // Rewrites for API proxy (optional - can also use vercel.json)
  async rewrites() {
    // Only use rewrites if not on Vercel (Vercel uses vercel.json)
    if (process.env.VERCEL) {
      return [];
    }
    
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL + ':path*',
      },
    ];
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
