/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['172.16.3.245'],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
