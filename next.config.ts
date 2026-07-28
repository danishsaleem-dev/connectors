import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No remote image host and no uploads on the marketing site — every visual is
  // SVG or CSS. Keeping the optimizer off means next/image renders a plain <img>
  // with no /_next/image proxy call and zero Image Optimization usage on Vercel.
  images: {
    unoptimized: true,
  },
  // Smaller client bundles → lower TBT. Pull only what's used from big barrels.
  experimental: {
    optimizePackageImports: ["lucide-react", "motion"],
  },
  poweredByHeader: false,
  compress: true,
};

export default nextConfig;
