import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  
  images: {
    formats: ["image/avif", "image/webp"],
  },

  
  compress: true,

  
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          
          { key: "X-Content-Type-Options", value: "nosniff" },
          
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          
          { key: "X-DNS-Prefetch-Control", value: "on" },
          
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          
          { key: "Content-Language", value: "ar" },
        ],
      },
      
      {
        source: "/fonts/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/audio/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
      
      {
        source: "/api/quran/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=86400, stale-while-revalidate=604800",
          },
        ],
      },
      {
        source: "/api/adhkar/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
