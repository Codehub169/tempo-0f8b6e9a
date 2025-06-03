/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Enable static HTML export
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['source.unsplash.com', 'picsum.photos'],
    unoptimized: true, // Required for 'next export' when using next/image without a custom loader
  },
  env: {
    NEXT_PUBLIC_API_URL: '/api/v1', // API will be on the same domain, relative path
  },
  // devServer configuration is for `next dev` and not relevant for `next export`
  // trailingSlash: true, // Consider if needed for your static hosting or routing
  async redirects() {
    return [];
  },
  async rewrites() {
    return [];
  }
};

module.exports = nextConfig;
