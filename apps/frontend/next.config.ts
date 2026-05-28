import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@gather/shared-types', '@gather/socket-events'],
};

export default nextConfig;
