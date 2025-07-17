# 📊 바로보드 (Baroboard)

<div align="center">

![Baroboard Logo](public/og-image.svg)

**실시간 데이터 시각화를 위한 대시보드 분석 플랫폼**

[![Deploy](https://img.shields.io/badge/deploy-firebase-orange.svg)](https://baroboard.web.app)
[![Next.js](https://img.shields.io/badge/Next.js-15.4.1-black.svg)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-11.10.0-orange.svg)](https://firebase.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-38bdf8.svg)](https://tailwindcss.com/)

[🌐 라이브 데모](https://baroboard.web.app) • [📊 주요 기능](#주요-기능) • [🚀 빠른 시작](#빠른-시작) • [📖 문서](#문서)

</div>

---

## ✨ 주요 기능

### 🎯 **핵심 분석 기능**
- **100+ 사전 제작 쿼리** - 포괄적인 배달 서비스 분석
- **실시간 데이터 시각화** - 인터랙티브 차트와 그래프
- **다중 분석 타입** - 분석, 보고서, 대시보드
- **고급 필터링** - 스마트 검색 및 카테고리화

### 🔥 **Firebase 통합**
- **Firestore 데이터베이스** - 실시간 데이터 저장 및 동기화
- **분석 추적** - 사용자 행동 및 쿼리 선택 모니터링
- **인증 준비** - Firebase Auth 통합 준비 완료
- **클라우드 함수** - 서버리스 백엔드 기능

### 🤖 **AI 기반 기능**
- **n8n 챗봇** - 지능형 쿼리 어시스턴트
- **자동화된 인사이트** - AI 기반 데이터 분석
- **스마트 추천** - 개인화된 쿼리 제안

### 📱 **모던 UI/UX**
- **반응형 디자인** - 모바일 우선 접근법
- **실시간 업데이트** - 라이브 데이터 동기화
- **다크/라이트 테마** - 사용자 정의 가능한 인터페이스
- **접근성** - WCAG 2.1 준수

### 🔧 **개발자 경험**
- **TypeScript** - 완전한 타입 안전성
- **컴포넌트 라이브러리** - 재사용 가능한 UI 컴포넌트
- **테스트 스위트** - Playwright 엔드투엔드 테스트
- **CI/CD 파이프라인** - 자동화된 배포

---

## 🚀 빠른 시작

### 사전 요구사항
```bash
node >= 18.0.0
npm >= 9.0.0
```

### 설치
```bash
# 저장소 클론
git clone https://github.com/your-org/baroboard.git
cd baroboard

# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env.local
# .env.local 파일을 Firebase 설정으로 편집

# 개발 서버 시작
npm run dev
```

### 🔥 Firebase 설정
1. [Firebase 콘솔](https://console.firebase.google.com)에서 Firebase 프로젝트 생성
2. Firestore 데이터베이스와 Analytics 활성화
3. Firebase 설정을 `src/firebase.ts`에 복사
4. Firebase Hosting에 배포:
```bash
npm run deploy
```

---

## 🏗️ 아키텍처

### **기술 스택**
- **프론트엔드**: Next.js 15.4.1 + React 19.1.0
- **스타일링**: Tailwind CSS 3.4.17 + 커스텀 디자인 시스템
- **차트**: Chart.js 4.5.0 + React-Chartjs-2 5.3.0
- **백엔드**: Firebase (Firestore + Analytics + Auth)
- **AI/채팅**: n8n 통합 0.47.0
- **테스팅**: Playwright 1.54.1
- **배포**: Firebase Hosting + GitHub Actions

### **프로젝트 구조**
```
baroboard/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── layout.tsx       # 루트 레이아웃 (메타데이터 포함)
│   │   ├── page.tsx         # 홈 페이지
│   │   └── query/[id]/      # 동적 쿼리 페이지
│   ├── components/          # 재사용 가능한 컴포넌트
│   │   ├── Dashboard.tsx    # 메인 대시보드 컨테이너
│   │   ├── Sidebar.tsx      # 쿼리 목록 사이드바
│   │   ├── Container.tsx    # 콘텐츠 컨테이너
│   │   ├── Graph.tsx        # 차트 시각화
│   │   ├── GNB.tsx          # 글로벌 네비게이션 바
│   │   └── FloatingChatbot.tsx # n8n 채팅 통합
│   ├── firebase.ts          # Firebase 설정
│   └── styles/              # 글로벌 스타일 및 테마
├── public/
│   ├── og-image.svg         # Open Graph 썸네일
│   └── ...                  # 정적 자산
├── tests/                   # Playwright 테스트 스위트
├── firebase.json            # Firebase 배포 설정
└── README.md               # 이 파일
```

---

## 📊 주요 컴포넌트

### **대시보드 시스템**
- **쿼리 관리**: 100+ 배달 분석 쿼리
- **데이터 시각화**: 선형, 막대, 도넛 차트
- **실시간 업데이트**: 라이브 데이터 동기화
- **내보내기 기능**: PDF, Excel, JSON 내보내기

### **분석 카테고리**
- 📈 **배달 성과**: 기사 효율성, 배달 시간
- 🍕 **주문 분석**: 볼륨 트렌드, 고객 행동
- 🏪 **음식점 인사이트**: 카테고리 성과, 평점
- 🎯 **비즈니스 인텔리전스**: 매출, 성장 지표
- 🔍 **고객 분석**: 만족도, 재주문률

### **Firebase 기능**
- **쿼리 추적**: 모든 쿼리 선택이 Firestore에 기록
- **세션 분석**: 사용자 행동 및 참여 지표
- **실시간 동기화**: 연결된 모든 클라이언트에서 라이브 업데이트
- **오프라인 지원**: 프로그레시브 웹 앱 기능

---

## 🎨 디자인 시스템

### **컬러 팔레트**
- **주 색상**: 바이탈 오렌지 (`#fa5014`) - 바로보드 시그니처 컬러
- **보조 색상**: 프로페셔널 그레이 (`#6c757d`)
- **성공**: 포레스트 그린 (`#28a745`)
- **경고**: 앰버 (`#ffc107`)
- **배경**: 클린 화이트 (`#ffffff`)

### **타이포그래피**
- **주 폰트**: Geist Sans (현대적, 가독성 우수)
- **모노스페이스**: Geist Mono (코드, 데이터용)
- **반응형**: 모바일 우선 타이포그래피 스케일

### **컴포넌트**
- **카드**: 부드러운 그림자를 가진 엘리베이티드 디자인
- **버튼**: 일관된 상호작용 패턴
- **폼**: 접근 가능하고 검증된 입력
- **차트**: 커스터마이징된 Chart.js 테마

---

## 🧪 테스트

### **테스트 커버리지**
```bash
# 모든 테스트 실행
npm run test

# UI와 함께 테스트 실행
npm run test:ui

# 테스트 리포트 보기
npm run test:report
```

### **테스트 카테고리**
- **컴포넌트 테스트**: UI 컴포넌트 기능
- **통합 테스트**: Firebase 및 API 상호작용
- **E2E 테스트**: 완전한 사용자 워크플로우
- **성능 테스트**: 로드 및 렌더링 지표

---

## 🚀 배포

### **개발 환경**
```bash
npm run dev          # 개발 서버 시작
npm run lint         # ESLint 검사 실행
npm run build        # 프로덕션용 빌드
```

### **프로덕션 환경**
```bash
npm run deploy       # 빌드 후 Firebase에 배포
```

### **환경 변수**
```bash
# .env.local
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_N8N_WEBHOOK_URL=your_n8n_webhook
```

---

## 📈 성능

### **Lighthouse 점수**
- **성능**: 95+ 
- **접근성**: 100
- **모범 사례**: 100
- **SEO**: 100

### **주요 최적화**
- **정적 생성**: 빠른 로딩을 위한 사전 렌더링된 페이지
- **이미지 최적화**: Next.js 자동 이미지 최적화
- **코드 분할**: 최적의 번들 크기를 위한 지연 로딩
- **CDN 배포**: Firebase Hosting 글로벌 배포

---

## 🤝 기여하기

### **개발 워크플로우**
1. **포크** 저장소 포크
2. **브랜치 생성** (`git checkout -b feature/amazing-feature`)
3. **변경사항 커밋** (`git commit -m 'feat: 멋진 기능 추가'`)
4. **브랜치에 푸시** (`git push origin feature/amazing-feature`)
5. **Pull Request 열기**

### **커밋 컨벤션**
```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 업데이트
style: 포맷팅 변경
refactor: 코드 리팩토링
test: 테스트 추가
chore: 유지보수 작업
```

### **코드 표준**
- **TypeScript**: 엄격한 타입 검사
- **ESLint**: 일관된 코드 포맷팅
- **Prettier**: 자동화된 코드 포맷팅
- **Husky**: 커밋 전 훅

---

## 📝 라이선스

이 프로젝트는 **MIT 라이선스** 하에 라이선스됩니다 - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

---

## 🏢 소개

**바로보드**는 **AInity4**에서 개발한 배달 및 물류 산업을 위한 AI 기반 분석 솔루션의 선도적인 제공업체입니다.

### **주요 통계**
- 🚀 **100+** 내장 분석 쿼리
- 📊 **실시간** 데이터 시각화
- 🔥 **Firebase** 클라우드 통합
- 🤖 **AI 기반** 챗봇 어시스턴트
- 📱 **모바일 우선** 반응형 디자인

---

## 🔗 링크

- **라이브 데모**: [baroboard.web.app](https://baroboard.web.app)
- **Firebase 콘솔**: [console.firebase.google.com](https://console.firebase.google.com/project/baroboard)
- **문서**: [준비 중]
- **지원**: [issues@baroboard.com]

---

<div align="center">

**AInity4가 ❤️로 만든 프로젝트**

[![Deploy to Firebase](https://img.shields.io/badge/Deploy%20to-Firebase-orange.svg)](https://baroboard.web.app)

</div>
