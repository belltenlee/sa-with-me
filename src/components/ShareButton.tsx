'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    Kakao: any;
  }
}

export default function ShareButton() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.6.0/kakao.min.js';
    script.async = true;
    script.onload = () => {
      if (!window.Kakao.isInitialized()) {
        window.Kakao.init(process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY);
      }
    };
    document.head.appendChild(script);
  }, []);

  const handleShare = () => {
    if (window.Kakao) {
      window.Kakao.Share.sendDefault({
        objectType: 'location',
        address: '서울 강남구 청담동 123-45',
        addressTitle: '더채플앳청담',
        content: {
          title: '우리 결혼합니다',
          description: '2024년 8월 15일 토요일 오후 2시\n더채플앳청담',
          imageUrl: 'https://your-image-url.jpg', // 나중에 실제 이미지로 교체 필요
          link: {
            mobileWebUrl: window.location.href,
            webUrl: window.location.href,
          },
        },
        buttons: [
          {
            title: '청첩장 보기',
            link: {
              mobileWebUrl: window.location.href,
              webUrl: window.location.href,
            },
          },
          {
            title: '길찾기',
            link: {
              mobileWebUrl: `https://map.kakao.com/link/to/더채플앳청담,37.5252,127.0382`,
              webUrl: `https://map.kakao.com/link/to/더채플앳청담,37.5252,127.0382`,
            },
          },
        ],
      });
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center justify-center gap-2 bg-yellow-400 text-black px-4 py-2 rounded-full hover:bg-yellow-500 transition-colors"
    >
      <svg 
        className="w-5 h-5" 
        viewBox="0 0 24 24" 
        fill="currentColor"
      >
        <path d="M12 3C7.03 3 3 7.03 3 12C3 16.97 7.03 21 12 21C16.97 21 21 16.97 21 12C21 7.03 16.97 3 12 3ZM15.92 14.92L11.61 17.89C11.09 18.24 10.38 17.95 10.28 17.32L9.27 12.89L5.96 10.58C5.4 10.17 5.45 9.25 6.06 8.92L16.03 4.11C16.68 3.75 17.37 4.44 17.01 5.1L15.92 14.92Z"/>
      </svg>
      카카오톡 공유하기
    </button>
  );
} 