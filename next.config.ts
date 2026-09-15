import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "contents.kyobobook.co.kr",
        pathname: "/sih/fit-in/**",
      },
    ],
  },
};

export default nextConfig;
