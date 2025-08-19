/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',           // S3 정적 호스팅용 내보내기
  trailingSlash: true,        // S3 디렉토리 구조용
  distDir: 'out',            // 출력 디렉토리
  images: {
    unoptimized: true         // S3에서는 이미지 최적화 불가
  }
};

module.exports = nextConfig; 