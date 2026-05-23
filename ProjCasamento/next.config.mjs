/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  async rewrites() {
    return [
      {
        source: "/convite/og.png",
        destination: "/api/og/convite",
      },
    ];
  },
};

export default nextConfig;
