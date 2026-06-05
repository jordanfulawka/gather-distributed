import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@gather/shared-types', '@gather/socket-events'],
  turbopack: {},
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

export default nextConfig;
