/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['core-agents', 'shared-types'],
  experimental: {
    serverComponentsExternalPackages: ['openai'],
  },
}

module.exports = nextConfig
