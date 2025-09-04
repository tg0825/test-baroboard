/** @type {import('next').NextConfig} */
const nextConfig = {
  // 개발 환경에서는 정적 export 비활성화
  ...(process.env.NODE_ENV === 'production' && {
    output: 'export',                    // 정적 호스팅용 내보내기 (프로덕션만)
    trailingSlash: false,               // Cloudflare Pages SPA 라우팅 호환
    distDir: 'out',                     // 출력 디렉토리
    skipTrailingSlashRedirect: true,    // 슬래시 리다이렉트 스킵
  }),
  
  images: {
    unoptimized: true                 // 정적 호스팅에서는 이미지 최적화 불가
  },
  
  // 개발 서버에서 동적 라우팅 지원 (개발 환경에서만)
  ...(process.env.NODE_ENV === 'development' && {
    async rewrites() {
      return [
        {
          source: '/query/:id',
          destination: '/',
        },
      ];
    },
  }),
};

module.exports = nextConfig; 