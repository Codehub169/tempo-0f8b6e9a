/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['source.unsplash.com', 'picsum.photos'], // Added picsum.photos for placeholder images
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  },
  // Ensure Next.js listens on port 9000 in development
  // For production, the startup.sh script will handle port mapping if necessary
  // This is more of a convention for `next dev`
  devServer: {
    port: 9000,
  },
  async redirects() {
    return [];
  },
  async rewrites() {
    return [];
  }
};

module.exports = nextConfig;
