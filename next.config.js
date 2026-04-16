/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Prevent pdfjs-dist from trying to load canvas in Node/server context
    config.resolve.alias.canvas = false;
    return config;
  },
};

module.exports = nextConfig;
