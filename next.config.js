/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,  // 슬래시 제거
  images: {
    unoptimized: true
  }
};

module.exports = nextConfig; 