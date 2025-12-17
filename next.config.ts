import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // Ignora erros de tipagem do TS durante o build
    ignoreBuildErrors: true,
  },
};

export default nextConfig;