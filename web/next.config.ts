import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Disable caching during development
  ...(process.env.NODE_ENV === 'development' && {
    onDemandEntries: {
      maxInactiveAge: 0,
    },
  }),
};

export default nextConfig;
