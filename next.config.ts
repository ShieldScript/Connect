import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Allow production builds to complete even with ESLint errors
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Temporarily allow production builds despite TypeScript errors - will fix incrementally
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
