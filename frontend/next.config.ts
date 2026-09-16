import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: "/api/google/:path*",
        destination:
          "https://trymonkmode-backend-177539415888.asia-south1.run.app/api/google/:path*",
      },
      {
        source: "/api/google",
        destination:
          "https://trymonkmode-backend-177539415888.asia-south1.run.app/api/google",
      },
    ];
  },
};

export default nextConfig;
