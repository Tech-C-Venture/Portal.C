import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@supabase/supabase-js"],
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
