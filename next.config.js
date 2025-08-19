/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',                    // 정적 호스팅용 내보내기
  trailingSlash: false,               // Cloudflare Pages SPA 라우팅 호환
  distDir: 'out',                     // 출력 디렉토리
  skipTrailingSlashRedirect: true,    // 슬래시 리다이렉트 스킵
  images: {
    unoptimized: true                 // 정적 호스팅에서는 이미지 최적화 불가
  }
};

module.exports = nextConfig; 