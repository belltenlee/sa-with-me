'use client';

import { useEffect, useState } from 'react';
import InfoPopup from './InfoPopup';

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
  const [isLoaded, setIsLoaded] = useState(false);
  const [isParkingPopupOpen, setIsParkingPopupOpen] = useState(false);
  const [isMapInteractive, setIsMapInteractive] = useState(false);

  useEffect(() => {
    const mapScript = document.createElement('script');
    mapScript.async = true;
    const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY;
    mapScript.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false`;
    document.head.appendChild(mapScript);

    const onLoadKakaoMap = () => {
      window.kakao.maps.load(() => {
        const container = document.getElementById('map');
        if (!container) return;

        const options = {
          center: new window.kakao.maps.LatLng(37.4624, 127.0369),
          level: 3,
        };
        const map = new window.kakao.maps.Map(container, options);

        // Marker
        const markerPosition = new window.kakao.maps.LatLng(37.4624, 127.0369);
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
          ">라시따시어터</div>
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

        {/* Map Interaction Overlay */}
        {!isMapInteractive && isLoaded && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center bg-black/5 cursor-pointer"
            onClick={() => setIsMapInteractive(true)}
            onTouchStart={() => setIsMapInteractive(true)}
          >
            <div className="bg-white/90 px-4 py-2 rounded-full shadow-lg text-sm font-serif text-charcoal animate-pulse">
              지도를 움직이려면 터치하세요
            </div>
          </div>
        )}

        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm bg-gray-50">
            지도를 불러오는 중...
          </div>
        )}
      </div>

      <div className="text-center space-y-2 font-serif text-charcoal">
        <p className="text-lg font-bold">라시따시어터</p>
        <p className="text-sm text-gray-500">서울 서초구 매헌로 16</p>
        <p className="text-sm text-gray-500">라시따시어터 1층 그랜드볼룸</p>
      </div>

      <div className="space-y-3">
        <div>
          <h4 className="font-bold text-gold mb-2 text-center">주차 안내</h4>
          {/* div 영역 내 좌측여백 추가 화면퍼센티지로 */}
          <div className="pl-[10%] space-y-2">
            <ul className="list-disc list-inside space-y-1 text-sm break-keep">
              <li>주차 최대 1,000대 가능</li>
              <li>3시간 무료 주차 (차량 등록 불필요)</li>
              <li>
                <span>주차 유도선을 따라 이동</span>
                <div className="mt-1 space-y-1">
                  <p className="pl-[3%] text-blue-600">파란색 유도선 {'=>'} <span className="font-bold">지하 3층 주차장 (추천)</span></p>
                  <p className="pl-[3%] text-pink-500">분홍색 유도선 {'=>'} 지상 타워 주차장</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-3 flex-wrap">
        <a
          href="https://map.kakao.com/link/to/라시따시어터,37.4624,127.0369"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#FAE100] text-[#3C1E1E] px-6 py-2 rounded-full text-sm font-bold hover:opacity-90 transition-opacity"
        >
          카카오맵
        </a>
        <a
          href="https://map.naver.com/p/search/라시따시어터"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#03C75A] text-white px-6 py-2 rounded-full text-sm font-bold hover:opacity-90 transition-opacity"
        >
          네이버지도
        </a>
        {/* <a
          href="tel:02-2155-2222"
          className="bg-charcoal text-white px-6 py-2 rounded-full text-sm font-serif hover:bg-gold transition-colors"
        >
          전화하기
        </a> */}
        {/*
        <button
          onClick={() => setIsParkingPopupOpen(true)}
          className="bg-white border border-charcoal text-charcoal px-6 py-2 rounded-full text-sm font-serif hover:bg-gray-50 transition-colors"
        >
          주차 안내
        </button>*/}
      </div>

      <InfoPopup
        isOpen={isParkingPopupOpen}
        onClose={() => setIsParkingPopupOpen(false)}
        title="주차 안내"
        content={
          <div className="space-y-4">
            <div className="bg-gray-100 rounded-lg p-4 text-center text-sm text-gray-500 mb-4">
              (주차장 약도 이미지 준비중)
            </div>
            <div>
              <h4 className="font-bold text-gold mb-2">주차장 위치</h4>
              <p className="text-sm text-gray-500 mt-2 mb-2">서울 서초구 매헌로 16 라시따시어터</p>
              <p>지상 타워 주차장 및 지하 3층 주차장</p>

            </div>
            <div>
              <h4 className="font-bold text-gold mb-2">주차 안내</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>하객 3시간 무료 주차</li>
                <li>주자 등록 불필요</li>
                <li>지하주차장 이용 시 3층 이용 필수</li>
              </ul>
            </div>
          </div>
        }
      />
    </div>
  );
}