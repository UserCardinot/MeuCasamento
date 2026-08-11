/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: {
    serverActions: {
      bodySizeLimit: "1024mb",
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
