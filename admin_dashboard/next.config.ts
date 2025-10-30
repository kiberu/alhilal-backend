import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output standalone for Docker production builds
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,

  // Asset prefix for production (not needed for dev)
  // assetPrefix: process.env.NODE_ENV === 'production' ? '/admin-dashboard' : undefined,
  // basePath: process.env.NODE_ENV === 'production' ? '/admin-dashboard' : undefined,

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
    unoptimized: process.env.NODE_ENV === 'development',
  },

  // React strict mode
  reactStrictMode: true,

  // Allow build to succeed with lint warnings
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

  // Environment variables are handled by .env files
  experimental: {
    // Enable experimental features if needed
  },
};

export default nextConfig;
