import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Disable caching during development
  ...(process.env.NODE_ENV === 'development' && {
    onDemandEntries: {
      maxInactiveAge: 0,
    },
  }),

  // SEO: Ensure consistent URL structure (no trailing slashes)
  trailingSlash: false,

  // Redirects for SEO consistency
  async redirects() {
    return [
      // Redirect www to non-www for canonical consistency
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.alhilaltravels.com',
          },
        ],
        destination: 'https://alhilaltravels.com/:path*',
        permanent: true,
      },
    ];
  },

  // Headers for SEO and security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
        ],
      },
    ];
  },
};

export default nextConfig;
