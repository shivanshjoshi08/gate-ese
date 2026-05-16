/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  /** Mongoose on Vercel serverless */
  experimental: {
    serverComponentsExternalPackages: ["mongoose"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
