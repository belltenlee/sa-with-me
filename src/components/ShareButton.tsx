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
        address: '서울 서초구 매헌로 16',
        addressTitle: '라시따시어터',
        content: {
          title: '우리 결혼합니다',
          description: '2025년 2월 21일 토요일 오후 5시\n라시따시어터',
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
              mobileWebUrl: `https://map.kakao.com/link/to/라시따시어터,37.4624,127.0369`,
              webUrl: `https://map.kakao.com/link/to/라시따시어터,37.4624,127.0369`,
            },
          },
        ],
      });
    }
  };

  // <section className="py-16 px-6 flex justify-center">
  //   <button className="bg-charcoal text-white px-8 py-3 rounded-full hover:bg-gold transition-colors duration-300 font-serif">
  //     청첩장 공유하기
  //   </button>
  // </section>

  return (
    <section className="py-12 px-6 flex justify-center">
      <button
        onClick={handleShare}
        // className="flex items-center justify-center gap-2 bg-yellow-400 text-black px-4 py-2 rounded-full hover:bg-yellow-500 transition-colors"
        className="flex items-center justify-center gap-2 bg-[#FAE100] text-[#3C1E1E] px-8 py-3 rounded-full hover:bg-gold transition-colors duration-300 font-pretendard"
      >
        카카오톡 공유하기
      </button>
    </section>

  );
} 