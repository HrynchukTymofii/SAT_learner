import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
        remotePatterns: [
          {
            // Cloudflare R2 bucket sat-media (course images, lesson videos)
            protocol: 'https',
            hostname: 'media.satlearner.com',
            pathname: '/**',
          },
          {
            // Old UploadThing hosts, kept as a fallback
            protocol: 'https',
            hostname: 'utfs.io',
            pathname: '/**',
          },
          {
            protocol: 'https',
            hostname: 'p48gqac1wm.ufs.sh',
            pathname: '/**',
          },
        ],
      },
};

export default nextConfig;
