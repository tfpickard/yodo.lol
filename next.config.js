/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['i.redd.it', 'preview.redd.it', 'external-preview.redd.it', 'i.imgur.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.reddit.com',
      },
      {
        protocol: 'https',
        hostname: '**.redd.it',
      },
      {
        protocol: 'https',
        hostname: '**.imgur.com',
      },
    ],
  },
}

module.exports = nextConfig
