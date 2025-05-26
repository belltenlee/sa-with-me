'use client';

import { useEffect } from 'react';

interface KakaoLatLng {
  getLat(): number;
  getLng(): number;
}

interface KakaoMap {
  setCenter(position: KakaoLatLng): void;
  setLevel(level: number): void;
  getLevel(): number;
  getCenter(): KakaoLatLng;
}

interface KakaoMarker {
  setMap(map: KakaoMap | null): void;
  getPosition(): KakaoLatLng;
}

interface KakaoCustomOverlay {
  setMap(map: KakaoMap | null): void;
  setPosition(position: KakaoLatLng): void;
}

interface KakaoMaps {
  maps: {
    load: (callback: () => void) => void;
    LatLng: new (lat: number, lng: number) => KakaoLatLng;
    Map: new (container: HTMLElement, options: { center: KakaoLatLng; level: number }) => KakaoMap;
    Marker: new (options: { position: KakaoLatLng }) => KakaoMarker;
    CustomOverlay: new (options: { 
      content: string; 
      position: KakaoLatLng;
      yAnchor?: number;
    }) => KakaoCustomOverlay;
  };
}

declare global {
  interface Window {
    kakao: KakaoMaps;
  }
}

export default function Map() {
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
        
        // 마커 추가
        const markerPosition = new window.kakao.maps.LatLng(37.5252, 127.0382);
        const marker = new window.kakao.maps.Marker({
          position: markerPosition,
        });
        marker.setMap(map);

        // 커스텀 오버레이로 변경
        const content = `
          <div style="
            position: relative;
            bottom: 40px;
            padding: 5px 10px;
            background: white;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            color: #333;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          ">더채플앳청담</div>
        `;

        const customOverlay = new window.kakao.maps.CustomOverlay({
          content: content,
          position: markerPosition,
          yAnchor: 1,
        });
        
        customOverlay.setMap(map);
      });
    };

    mapScript.addEventListener('load', onLoadKakaoMap);

    return () => {
      mapScript.removeEventListener('load', onLoadKakaoMap);
    };
  }, []);

  return (
    <div className="w-full">
      <div 
        id="map" 
        className="w-full h-[400px] rounded-lg shadow-lg"
      />
      <div className="mt-4 flex justify-center space-x-4">
        <a
          href="https://map.kakao.com/link/to/더채플앳청담,37.5252,127.0382"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-yellow-400 text-black px-4 py-2 rounded-full hover:bg-yellow-500 transition-colors"
        >
          길찾기
        </a>
        <a
          href="tel:02-1234-5678"
          className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition-colors"
        >
          전화하기
        </a>
      </div>
    </div>
  );
} 