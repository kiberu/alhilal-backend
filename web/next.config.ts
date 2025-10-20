import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output standalone for Docker production builds
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  
  // Asset prefix for production
  assetPrefix: process.env.NODE_ENV === 'production' ? '/admin-dashboard' : undefined,
  basePath: process.env.NODE_ENV === 'production' ? '/admin-dashboard' : undefined,
  
  // Image optimization
  images: {
    domains: ['res.cloudinary.com', 'localhost'],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  
  // React strict mode
  reactStrictMode: true,
  
  // Disable telemetry
  telemetry: false,
  
  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  },
};

export default nextConfig;
