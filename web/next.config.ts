import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.NODE_ENV === 'development' && {
    onDemandEntries: {
      maxInactiveAge: 0,
    },
  }),
  trailingSlash: false,

  async redirects() {
    return [
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
      {
        source: '/trip-calendar',
        destination: '/journeys',
        permanent: true,
      },
      {
        source: '/who-we-are',
        destination: '/about',
        permanent: true,
      },
      {
        source: '/services',
        destination: '/journeys',
        permanent: true,
      },
    ];
  },

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
