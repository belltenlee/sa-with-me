'use client';

import { useEffect, useState } from 'react';

declare global {
  interface Window {
    kakao: any;
  }
}

export default function Map() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const mapScript = document.createElement('script');
    mapScript.async = true;
    mapScript.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&autoload=false`;
    document.head.appendChild(mapScript);

    const onLoadKakaoMap = () => {
      window.kakao.maps.load(() => {
        const container = document.getElementById('map');
        if (!container) return;

        const options = {
          center: new window.kakao.maps.LatLng(37.5252, 127.0382),
          level: 3,
        };
        const map = new window.kakao.maps.Map(container, options);

        // Marker
        const markerPosition = new window.kakao.maps.LatLng(37.5252, 127.0382);
        const marker = new window.kakao.maps.Marker({
          position: markerPosition,
        });
        marker.setMap(map);

        // Custom Overlay
        const content = `
          <div style="
            padding: 8px 16px;
            background: white;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 600;
            color: #2C2C2C;
            text-align: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            font-family: serif;
            border: 1px solid #F9F7F2;
          ">더채플앳청담</div>
        `;

        const customOverlay = new window.kakao.maps.CustomOverlay({
          content: content,
          position: markerPosition,
          yAnchor: 2.2,
        });

        customOverlay.setMap(map);
        setIsLoaded(true);
      });
    };

    mapScript.addEventListener('load', onLoadKakaoMap);

    return () => {
      mapScript.removeEventListener('load', onLoadKakaoMap);
    };
  }, []);

  return (
    <div className="w-full space-y-6">
      <div className="relative w-full h-[300px] rounded-lg overflow-hidden shadow-md bg-gray-100">
        <div id="map" className="w-full h-full" />
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm bg-gray-50">
            지도를 불러오는 중...
          </div>
        )}
      </div>

      <div className="text-center space-y-2 font-serif text-charcoal">
        <p className="text-lg font-bold">더채플앳청담</p>
        <p className="text-sm text-gray-500">서울 강남구 청담동 123-45</p>
      </div>

      <div className="flex justify-center gap-4">
        <a
          href="https://map.kakao.com/link/to/더채플앳청담,37.5252,127.0382"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#FAE100] text-[#3C1E1E] px-6 py-2 rounded-full text-sm font-bold hover:opacity-90 transition-opacity"
        >
          카카오맵
        </a>
        <a
          href="tel:02-1234-5678"
          className="bg-charcoal text-white px-6 py-2 rounded-full text-sm font-serif hover:bg-gold transition-colors"
        >
          전화하기
        </a>
      </div>
    </div>
  );
}