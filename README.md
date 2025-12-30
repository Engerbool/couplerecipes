# 커플레시피 (CoupleRecipes)

> 우리 둘만의 완벽한 맛을 찾아가는 여정

커플을 위한 레시피 공유 앱입니다. 함께 만들고, 공유하고, 발전시키는 우리만의 레시피를 기록하세요.

## ✨ 주요 기능

- 🔐 **구글 로그인** - 간편한 Google OAuth 인증
- 👥 **1:1 파트너 공유** - 특별한 한 사람과만 레시피 공유
- 📝 **레시피 버전 관리** - 레시피를 개선하며 버전별로 기록
- 💬 **피드백 시스템** - 각 버전에 댓글과 평점 남기기
- 👨‍🍳 **요리 모드** - 단계별 체크리스트로 요리 진행
- 🌐 **다국어 지원** - 한국어/영어 지원
- 🎨 **세련된 UI** - Gowun Batang 폰트와 Tailwind CSS

## 🚀 기술 스택

- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Styling**: Tailwind CSS
- **i18n**: react-i18next
- **Deployment**: Firebase Hosting + GitHub Actions

## 💻 로컬 실행

**필수 조건:** Node.js 20+

1. **의존성 설치**
   ```bash
   npm install
   ```

2. **환경 변수 설정**

   `.env.local` 파일을 생성하고 Firebase 설정을 추가하세요:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

3. **개발 서버 실행**
   ```bash
   npm run dev
   ```

4. **브라우저에서 열기**
   ```
   http://localhost:5173
   ```

## 📦 배포

### 자동 배포 (GitHub Actions)
`main` 브랜치에 푸시하면 자동으로 Firebase Hosting에 배포됩니다.

```bash
git add .
git commit -m "Update features"
git push origin main
```

### 수동 배포
```bash
npm run deploy
```

## 🔒 보안

- Firebase Authentication으로 사용자 인증
- Firestore Security Rules로 데이터 보호
- 1:1 파트너십 시스템으로 프라이버시 보장

## 📝 라이선스

MIT License

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
