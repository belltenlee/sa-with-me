# 모바일 청첩장 웹사이트

Next.js와 TailwindCSS를 사용하여 만든 모바일 청첩장 웹사이트입니다.

## 주요 기능

- 웨딩 갤러리
- 예식장 위치 안내 (카카오맵 연동)
- 축의금 계좌번호 복사
- 카카오톡 공유하기

## 기술 스택

- Next.js 14
- React 18
- TailwindCSS
- Framer Motion
- TypeScript

## 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
```

## 환경 변수 설정

`.env.local` 파일을 생성하고 다음 환경변수를 설정해주세요:

```
NEXT_PUBLIC_KAKAO_MAP_API_KEY=your_kakao_map_api_key
```

## 라이선스

MIT License
