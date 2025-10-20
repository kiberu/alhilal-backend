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

  // Environment variables are handled by .env files
  experimental: {
    // Enable experimental features if needed
  },
};

export default nextConfig;
