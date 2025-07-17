// 바로보드 색상 시스템
export const colors = {
  // 바이탈오렌지 기반 색상
  primary: {
    main: '#fa5014',        // 바이탈오렌지 (키컬러)
    light: '#ff7a47',       // 밝은 오렌지 (호버, 액센트)
    lighter: '#ffb399',     // 매우 밝은 오렌지 (배경)
    dark: '#e63d00',        // 진한 오렌지 (강조)
    pale: '#fff4f1',        // 연한 오렌지 (배경)
  },
  
  // 보조 색상 (차분한 톤)
  secondary: {
    main: '#6c757d',        // 회색
    light: '#adb5bd',       // 밝은 회색
    lighter: '#e9ecef',     // 매우 밝은 회색
    dark: '#495057',        // 진한 회색
    pale: '#f8f9fa',        // 연한 회색 (배경)
  },
  
  // 기능적 색상 (부드러운 톤)
  success: {
    main: '#28a745',        // 성공
    light: '#5cbf60',       // 밝은 초록
    pale: '#f1f8f3',        // 연한 초록 배경
  },
  
  warning: {
    main: '#ffc107',        // 경고
    light: '#ffcd39',       // 밝은 노랑
    pale: '#fffbf0',        // 연한 노랑 배경
  },
  
  info: {
    main: '#17a2b8',        // 정보
    light: '#46c5d8',       // 밝은 청록
    pale: '#f0fafb',        // 연한 청록 배경
  },
  
  // 배경 및 텍스트
  background: {
    main: '#ffffff',        // 메인 배경
    soft: '#fafbfc',        // 부드러운 배경
    light: '#f5f6f7',       // 밝은 배경
  },
  
  text: {
    primary: '#2c3e50',     // 주요 텍스트 (진한 회색)
    secondary: '#6c757d',   // 보조 텍스트
    light: '#adb5bd',       // 밝은 텍스트
    muted: '#9ca3af',       // 약한 텍스트
  },
  
  // 테두리
  border: {
    main: '#e9ecef',        // 기본 테두리
    light: '#f1f3f4',       // 밝은 테두리
    primary: '#ffccb8',     // 오렌지 계열 테두리
  }
};

// 그라데이션
export const gradients = {
  primary: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.light} 100%)`,
  soft: `linear-gradient(135deg, ${colors.primary.pale} 0%, ${colors.background.soft} 100%)`,
  sunset: `linear-gradient(135deg, ${colors.primary.light} 0%, ${colors.warning.main} 100%)`,
};

// 그림자
export const shadows = {
  soft: '0 2px 8px rgba(250, 80, 20, 0.08)',
  medium: '0 4px 16px rgba(250, 80, 20, 0.12)',
  strong: '0 8px 32px rgba(250, 80, 20, 0.16)',
  button: '0 2px 8px rgba(250, 80, 20, 0.2)',
}; 