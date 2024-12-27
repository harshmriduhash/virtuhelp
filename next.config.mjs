/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  typescript: {
    // Disables type checking during the build
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
      };
    }
    return config;
  },
};

export default nextConfig;
