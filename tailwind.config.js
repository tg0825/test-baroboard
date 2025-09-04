/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      height: {
        '15': '60px',
      },
      width: {
        '15': '60px',
      },
      colors: {
        // 부드러운 오렌지 그라데이션 색상
        'primary-main': '#ff8c42',
        'primary-light': '#ffa366',
        'primary-lighter': '#ffbb88',
        'primary-dark': '#ff6b1a',
        'primary-pale': '#fff7f3',
        
        // 보조 색상
        'secondary-main': '#6c757d',
        'secondary-light': '#adb5bd',
        'secondary-lighter': '#e9ecef',
        'secondary-dark': '#495057',
        'secondary-pale': '#f8f9fa',
        
        // 기능적 색상
        'success-main': '#28a745',
        'success-light': '#5cbf60',
        'success-pale': '#f1f8f3',
        
        'warning-main': '#ffc107',
        'warning-light': '#ffcd39',
        'warning-pale': '#fffbf0',
        
        'info-main': '#17a2b8',
        'info-light': '#46c5d8',
        'info-pale': '#f0fafb',
        
        // 배경 및 텍스트
        'background-main': '#ffffff',
        'background-soft': '#fafbfc',
        'background-light': '#f5f6f7',
        
        'text-primary': '#2c3e50',
        'text-secondary': '#6c757d',
        'text-light': '#adb5bd',
        'text-muted': '#9ca3af',
        
        // 테두리
        'border-main': '#e9ecef',
        'border-light': '#f1f3f4',
        'border-primary': '#ffddcc',
      },
      boxShadow: {
        'soft': '0 2px 12px rgba(255, 140, 66, 0.1)',
        'medium': '0 4px 20px rgba(255, 140, 66, 0.15)',
        'strong': '0 8px 40px rgba(255, 140, 66, 0.2)',
        'button': '0 4px 16px rgba(255, 140, 66, 0.25)',
        'glow': '0 0 20px rgba(255, 140, 66, 0.3)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #ff8c42 0%, #ffa366 50%, #ffbb88 100%)',
        'gradient-soft': 'linear-gradient(135deg, #fff7f3 0%, #fffbf8 50%, #fafbfc 100%)',
        'gradient-sunset': 'linear-gradient(135deg, #ffa366 0%, #ffbb88 50%, #ffd4aa 100%)',
        'gradient-warm': 'linear-gradient(45deg, #ff8c42 0%, #ffb366 25%, #ffd4aa 50%, #fff2e6 100%)',
        'gradient-glow': 'radial-gradient(circle, #ff8c42 0%, #ffa366 30%, #ffbb88 60%, transparent 100%)',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'Monaco', 'Menlo', 'Ubuntu Mono', 'monospace'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 