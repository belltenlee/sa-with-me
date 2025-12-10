# 모바일 청첩장 웹사이트 (sa-with-me)

`sa-with-me`는 Next.js + TailwindCSS 기반으로 만든 모바일 친화적인 청첩장 웹사이트입니다. 손님들이 갤러리를 보고, 위치를 확인하고, 사진을 공유하거나 축의금 계좌를 복사할 수 있도록 구성되어 있습니다.

**주요 기능**
- 웨딩 갤러리 (이미지 업로드/미리보기)
- 예식장 위치 안내 (카카오맵 연동)
- 축의금 계좌번호 복사
- 카카오톡 공유 버튼
- 방명록(Guestbook)

**기술 스택**
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion
- Firebase (Firestore)

**빠른 시작**

1. 의존성 설치:

```bash
npm install
```

2. 개발 서버 실행:

```bash
npm run dev
```

3. 프로덕션 빌드:

```bash
npm run build
npm start
```

**환경 변수**

로컬에서 실행하려면 다음 단계를 따르세요:

1. `.env.example` 파일을 복사하여 `.env.local` 파일을 생성합니다:

```bash
cp .env.example .env.local
```

2. `.env.local` 파일을 열어 실제 API 키 값을 입력합니다:

```env
# 카카오맵 API 키 (필수)
NEXT_PUBLIC_KAKAO_MAP_API_KEY=your_kakao_map_api_key

# ImgBB (이미지 업로드용, 선택)
NEXT_PUBLIC_IMGBB_API_KEY=your_imgbb_api_key

# Cloudinary (이미지 업로드용, 추천)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset

# Firebase 클라이언트 설정 (필수)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
```

**중요**: `.env.local` 파일은 `.gitignore`에 포함되어 있어 Git에 커밋되지 않습니다. API 키를 안전하게 보관하세요.

**프로젝트 구조(요약)**

```
src/
	app/           # Next.js 앱 라우트
	components/    # UI 컴포넌트
	services/      # Firebase, 이미지 업로드 등 서비스 코드
	public/        # 정적 이미지/에셋
```

대표 파일:
- `src/app/page.tsx` — 메인 페이지
- `src/components/Gallery.tsx` — 갤러리 컴포넌트
- `src/services/firebase.ts` — Firebase 초기화 (현재 하드코딩된 설정 확인 필요)
- `src/services/imgbb.ts` — ImgBB 업로드 유틸

**배포**

Vercel에 배포하면 `NEXT_PUBLIC_*` 환경변수를 Vercel 환경설정에 등록하여 사용하세요. 정적 파일과 이미지 업로드 로직은 클라이언트와 서버 사이의 보안 요구사항에 따라 조정이 필요합니다.

**기여 방법**
- PR 생성 전에 이슈로 변경 의도를 알려주세요.
- 민감한 키는 절대 커밋하지 마세요. `.env.local`을 사용하세요.

**문제/연락처**
- 이 저장소에 대해 질문이 있거나 개선 제안이 있으면 이슈를 열어주세요.

**라이선스**
- MIT License

*** 변경 기록(간단)**
- 2025-12-07: README 확장 — 설치/환경변수/보안 주의 추가
