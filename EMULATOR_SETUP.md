# Firebase Emulator 설정 가이드

## 1. Firebase Emulator 설치

Firebase Emulator를 로컬에서 실행하여 안전하게 테스트할 수 있습니다.

```bash
# Firebase CLI가 없다면 설치
npm install -g firebase-tools

# 프로젝트 루트에서 Firebase 로그인
firebase login
```

## 2. 에뮬레이터 환경 변수 설정

`.env.local` 파일에 다음 내용 추가:

```env
VITE_USE_FIREBASE_EMULATOR=true
```

## 3. 에뮬레이터 실행

```bash
firebase emulators:start
```

실행되면:
- Firestore UI: http://localhost:4000
- Auth Emulator: http://localhost:9099
- Firestore Emulator: http://localhost:8080
- Storage Emulator: http://localhost:9199

## 4. 개발 서버 실행

다른 터미널에서:

```bash
npm run dev
```

이제 `http://localhost:5173`에서 앱이 에뮬레이터에 연결됩니다.

## 5. 프로덕션 모드로 전환

`.env.local`에서 플래그 제거 또는:

```env
VITE_USE_FIREBASE_EMULATOR=false
```

## 주의사항

- 에뮬레이터 데이터는 영구 저장되지 않습니다 (재시작 시 초기화)
- 프로덕션 배포 시 에뮬레이터 플래그가 꺼져있는지 확인하세요
