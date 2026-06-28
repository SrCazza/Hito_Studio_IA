import type { NextConfig } from "next";

/**
 * Headers de seguridad para todo el panel (M7). Es una herramienta interna:
 * sin embedding (anti-clickjacking), sin sniffing de tipos, referrer acotado y
 * permisos de hardware deshabilitados. Las rutas /api son same-origin (sin CORS
 * permisivo por defecto en Next), así que no se expone Access-Control-*.
 */
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
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
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
