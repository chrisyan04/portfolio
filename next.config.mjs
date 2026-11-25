/** @type {import('next').NextConfig} */
let supabaseHost;
try { supabaseHost = new URL(process.env.SUPABASE_URL).hostname; } catch { /* Local build without storage configured. */ }

const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["heic-convert"],
  },
  images: {
    remotePatterns: supabaseHost ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/portfolio-photos/**" }] : [],
  },
};

export default nextConfig;
