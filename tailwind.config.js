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
        // 바이탈오렌지 기반 색상
        'primary-main': '#fa5014',
        'primary-light': '#ff7a47',
        'primary-lighter': '#ffb399',
        'primary-dark': '#e63d00',
        'primary-pale': '#fff4f1',
        
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
        'border-primary': '#ffccb8',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(250, 80, 20, 0.08)',
        'medium': '0 4px 16px rgba(250, 80, 20, 0.12)',
        'strong': '0 8px 32px rgba(250, 80, 20, 0.16)',
        'button': '0 2px 8px rgba(250, 80, 20, 0.2)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #fa5014 0%, #ff7a47 100%)',
        'gradient-soft': 'linear-gradient(135deg, #fff4f1 0%, #fafbfc 100%)',
        'gradient-sunset': 'linear-gradient(135deg, #ff7a47 0%, #ffc107 100%)',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'Monaco', 'Menlo', 'Ubuntu Mono', 'monospace'],
      },
    },
  },
  plugins: [],
} 