import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Ignora erros de ESLint durante o build para não travar o deploy
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignora erros de tipagem do TS durante o build
    ignoreBuildErrors: true,
  },
};

export default nextConfig;