import type { NextConfig } from "next";

const BACKEND_URL = process.env.BACKEND_URL;

const nextConfig: NextConfig = {
  async rewrites() {
    const targetUrl = BACKEND_URL || "https://openwork-ai-production.up.railway.app";
    return [
      {
        source: "/api/:path*",
        destination: `${targetUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
