/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable instrumentation for Sentry
  experimental: {
    instrumentationHook: true,
  },
  
  // Suppress Supabase auth warnings in development
  webpack: (config) => {
    config.externals = [...(config.externals || []), { canvas: 'canvas' }];
    return config;
  },
};

module.exports = nextConfig;
