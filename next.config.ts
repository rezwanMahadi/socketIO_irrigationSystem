/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  eslint: {
    // Disable ESLint during builds (Vercel will still warn)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript errors during builds to allow Prisma's generated files
    ignoreBuildErrors: true,
  },
  // Handle potential Prisma engine compatibility issues
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), '@prisma/client', 'prisma'];
    }
    return config;
  },
};

export default nextConfig;
