import type { NextConfig } from "next";

const BACKEND_URL = process.env.BACKEND_URL;

const nextConfig: NextConfig = {
  async rewrites() {
    if (!BACKEND_URL) {
      console.warn("WARNING: BACKEND_URL environment variable is not set. API rewrites will not be active.");
      return [];
    }
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
