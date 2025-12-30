# Troubleshooting Guide

## 다크모드 구현 후 GitHub Actions 배포 실패 (2025-12-30)

### 문제 상황
다크모드 기능을 구현하고 커밋/푸시 후 GitHub Actions 빌드가 계속 실패했습니다.

### 원인 분석

#### 1. Tailwind CSS v4 PostCSS 플러그인 호환성 문제
- **문제**: Tailwind CSS v4는 PostCSS 플러그인이 별도 패키지(`@tailwindcss/postcss`)로 분리됨
- **에러 메시지**:
  ```
  It looks like you're trying to use `tailwindcss` directly as a PostCSS plugin.
  The PostCSS plugin has moved to a separate package, so to continue using
  Tailwind CSS with PostCSS you'll need to install `@tailwindcss/postcss`
  ```
- **시도한 해결책**: `@tailwindcss/postcss` 설치 후 `postcss.config.js` 수정
- **2차 문제**: v4에서 기존 유틸리티 클래스 인식 불가
  ```
  Cannot apply unknown utility class `bg-stone-100`
  ```

#### 2. Package 파일 미커밋
- **문제**: Tailwind v3로 다운그레이드 후 `package.json`과 `package-lock.json`을 커밋하지 않음
- **결과**: GitHub Actions가 로컬과 다른 버전(v4)을 설치하려고 시도
- **증상**: 로컬에서는 빌드 성공하지만 GitHub Actions는 계속 실패

#### 3. Tailwind Content 패턴 경고
- **문제**: Content 패턴 `./**/*.{js,ts,jsx,tsx}`가 `node_modules` 포함
- **경고 메시지**:
  ```
  Your `content` configuration includes a pattern which looks like it's
  accidentally matching all of `node_modules` and can cause serious
  performance issues.
  ```
- **영향**: 빌드 성능 저하 및 잠재적 문제 가능성

### 해결 방법

#### 1단계: Tailwind CSS v3로 다운그레이드
```bash
npm uninstall tailwindcss @tailwindcss/postcss
npm install -D tailwindcss@^3 postcss autoprefixer
```

#### 2단계: postcss.config.js 수정
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

#### 3단계: tailwind.config.js Content 패턴 수정
```javascript
content: [
  "./index.html",
  "./App.tsx",
  "./index.tsx",
  "./components/**/*.{js,ts,jsx,tsx}",
  "./contexts/**/*.{js,ts,jsx,tsx}",
  "./services/**/*.{js,ts,jsx,tsx}",
],
```

#### 4단계: 모든 변경사항 커밋
```bash
git add package.json package-lock.json tailwind.config.js
git commit -m "Fix Tailwind configuration and dependencies"
git push
```

### 교훈

1. **의존성 변경 시 즉시 커밋**: 로컬 환경과 CI/CD 환경의 불일치 방지
2. **package-lock.json 항상 커밋**: 정확한 버전 동기화 필수
3. **새 메이저 버전 주의**: Tailwind v4는 breaking changes가 많음
4. **Content 패턴 최적화**: 성능과 빌드 안정성을 위해 구체적인 경로 지정

### 관련 커밋
- `216ad55` - 다크모드 초기 구현
- `2e3bec8` - Tailwind content 패턴 수정
- `247ad45` - Tailwind v3 다운그레이드 및 package 파일 커밋

### 참고 자료
- [Tailwind CSS v4 Breaking Changes](https://tailwindcss.com/docs/upgrade-guide)
- [PostCSS Configuration](https://vitejs.dev/guide/features.html#postcss)
