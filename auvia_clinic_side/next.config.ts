/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://10.0.11.76:4002/api/:path*",
      },
    ];
  },
};

module.exports = nextConfig;