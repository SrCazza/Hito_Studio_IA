import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // La media pesada vive en Supabase Storage; en la DB solo van referencias.
  // Permite renderizar imágenes servidas desde el bucket público de Supabase.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

export default nextConfig;
