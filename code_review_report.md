# 🚨 AI 자율 기능 개발 완료 리포트

## 📋 개발 스펙 요약
청첩장 화면의 벚꽃잎 흩날림 효과를 제거하고, 핑크색 하트 입자가 하늘하늘 떨어지는 효과로 대체하는 UI/UX 개선 작업이 완료되었습니다. `FallingPetals` 컴포넌트의 로직을 수정하여 하트 모양을 렌더링하고, 관련 파일명 및 컴포넌트명을 `FallingHearts`로 변경하여 가독성을 높였습니다. `app/page.tsx`에서는 변경된 컴포넌트를 참조하도록 업데이트되었습니다.

## 🔒 위험도 자율 평가 및 안전 조치
- **[위험도 평가]**: LOW
- **사유**: 이 변경사항은 전적으로 클라이언트 측 UI/UX 개선에 중점을 둡니다. 기존 벚꽃잎 효과를 핑크색 하트 입자 효과로 대체하는 것으로, 캔버스 드로잉 로직과 컴포넌트 파일명 및 사용처만 변경됩니다. 데이터베이스 스키마, 결제 로직, 사용자 인증/권한, 개인정보 취급, 또는 전역 상태/클래스 등 시스템의 핵심 기능이나 민감한 부분에 대한 변경은 전혀 없습니다. `src/app/page.tsx`의 `fs.readdirSync` 로직은 기존에 존재하던 서버 사이드 이미지 로딩 로직이며, 변경된 것은 `FallingHearts` 컴포넌트의 import 및 사용뿐입니다. 따라서 시스템 전반에 미치는 영향이나 보안 위험은 매우 낮습니다.

## 🛠️ 자율 생성/수정 코드 목록

#### FILE: src/components/FallingHearts.tsx
```typescript
'use client';

import { useEffect, useRef } from 'react';

/**
 * @interface HeartParticle
 * @description Represents a single heart particle with its properties for animation.
 */
interface HeartParticle {
    x: number;
    y: number;
    size: number;
    speed: number;
    rotation: number;
    rotationSpeed: number;
    opacity: number;
    color: string;
}

/**
 * @component FallingHearts
 * @description Renders a canvas with falling pink heart particles, creating a subtle, romantic effect.
 * This component replaces the previous FallingPetals component.
 */
export default function FallingHearts() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        // Ensure canvas element exists before proceeding.
        if (!canvas) {
            console.error("Canvas element not found.");
            return;
        }

        const ctx = canvas.getContext('2d');
        // Ensure 2D rendering context is available.
        if (!ctx) {
            console.error("2D rendering context not available.");
            return;
        }

        let animationFrameId: number;
        let particles: HeartParticle[] = [];

        /**
         * @function handleResize
         * @description Adjusts canvas dimensions to match window size on resize events.
         */
        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        // Initialize canvas size and attach resize listener.
        handleResize();
        window.addEventListener('resize', handleResize);

        // Define a palette of pink colors for the hearts.
        const heartColors: string[] = ['#FFC0CB', '#FF69B4', '#FFB6C1', '#F08080', '#FFD1DC']; // Pink, HotPink, LightPink, LightCoral, Pastel Pink

        /**
         * @function createHeartParticle
         * @description Generates a new heart particle with random initial properties.
         * @returns {HeartParticle} A new heart particle object.
         */
        const createHeartParticle = (): HeartParticle => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height, // Start above the viewport for a falling effect
            size: Math.random() * 8 + 8, // Heart size between 8 and 16 pixels
            speed: Math.random() * 1 + 0.5, // Falling speed between 0.5 and 1.5 pixels/frame
            rotation: Math.random() * 360, // Initial rotation in degrees
            rotationSpeed: (Math.random() - 0.5) * 2, // Rotation speed between -1 and 1 degrees/frame for gentle spin
            opacity: Math.random() * 0.5 + 0.3, // Opacity between 0.3 and 0.8
            color: heartColors[Math.floor(Math.random() * heartColors.length)], // Random pink color
        });

        // Create an initial set of heart particles, distributing them across the screen.
        const numberOfInitialHearts = 30; // Fewer hearts for a subtle effect
        for (let i = 0; i < numberOfInitialHearts; i++) {
            particles.push({
                ...createHeartParticle(),
                y: Math.random() * canvas.height // Distribute initial particles vertically across the screen
            });
        }

        /**
         * @function drawHeart
         * @description Draws a heart shape on the canvas context.
         * @param {CanvasRenderingContext2D} context The 2D rendering context.
         * @param {number} scale The scale factor for the heart shape.
         */
        const drawHeart = (context: CanvasRenderingContext2D, scale: number) => {
            context.beginPath();
            // Heart shape defined using Bezier curves, centered around (0,0)
            // The 'scale' parameter controls the overall size of the heart
            context.moveTo(0, scale * 0.2); // Top center point
            context.bezierCurveTo(scale * 0.5, -scale * 0.8, scale * 1.2, scale * 0.2, 0, scale * 1.0); // Right side curve
            context.bezierCurveTo(-scale * 1.2, scale * 0.2, -scale * 0.5, -scale * 0.8, 0, scale * 0.2); // Left side curve
            context.closePath();
            context.fill();
        };

        /**
         * @function animate
         * @description The main animation loop for updating and drawing heart particles.
         */
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the entire canvas

            particles.forEach((particle) => {
                // Update particle position and rotation
                particle.y += particle.speed;
                particle.rotation += particle.rotationSpeed;
                particle.x += Math.sin(particle.y * 0.01) * 0.5; // Add a gentle horizontal sway

                // If a particle falls out of the bottom of the screen, reinitialize it at the top.
                if (particle.y > canvas.height) {
                    Object.assign(particle, createHeartParticle()); // Reinitialize all properties
                    particle.y = -20; // Start slightly above the viewport to ensure smooth re-entry
                }

                // Save the current canvas state, apply transformations, draw, and restore.
                ctx.save();
                ctx.translate(particle.x, particle.y); // Move origin to particle's position
                ctx.rotate((particle.rotation * Math.PI) / 180); // Rotate particle
                ctx.globalAlpha = particle.opacity; // Set particle opacity
                ctx.fillStyle = particle.color; // Set particle color

                // Draw the heart, scaling it based on the particle's size property.
                // The division by 10 is an arbitrary scaling factor to make the heart drawing function
                // work well with the `particle.size` range (8-16).
                drawHeart(ctx, particle.size / 10);

                ctx.restore(); // Restore canvas state
            });

            animationFrameId = requestAnimationFrame(animate); // Request next animation frame
        };

        animate(); // Start the animation loop

        // Cleanup function for useEffect
        return () => {
            window.removeEventListener('resize', handleResize); // Remove resize listener
            cancelAnimationFrame(animationFrameId); // Cancel any pending animation frame
        };
    }, []); // Empty dependency array ensures this effect runs only once on mount

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
            style={{ width: '100%', height: '100%' }}
            aria-hidden="true" // Hide from accessibility tree as it's a decorative effect
        />
    );
}
```
#### FILE: src/app/page.tsx
```typescript
import fs from 'fs';
import path from 'path';
import Hero from "@/components/Hero";
import Invitation from "@/components/Invitation";
import Guestbook from "@/components/Guestbook";
import Gallery from "@/components/Gallery";
import Map from "@/components/Map";
import ShareButton from "@/components/ShareButton";
import Account from "@/components/Account";
import WeddingInfo from "@/components/WeddingInfo";
import RsvpSection from "@/components/RsvpSection";
import FallingHearts from "@/components/FallingHearts"; // FallingPetals -> FallingHearts로 변경
import SectionHeader from "@/components/SectionHeader";

/**
 * @component Home
 * @description The main page component for the wedding invitation application.
 * It orchestrates various sections like Hero, Invitation, Gallery, Map, etc.
 */
export default function Home() {
  // Read gallery images at build time (Server-side)
  // This ensures image data is available when the component is rendered on the server.
  const galleryDir = path.join(process.cwd(), 'public/images/gallery');
  let initialImages: { src: string; alt: string }[] = [];

  try {
    // Synchronously read directory contents. This runs only on the server during build/SSR.
    const files = fs.readdirSync(galleryDir);
    initialImages = files
      // Filter for specific image naming conventions (e.g., G1.jpg, soho1.jpg, tell1.jpg)
      .filter((file: string) => /^(G|soho|tell)\d+\.jpg$/i.test(file))
      .map((file: string) => {
        const prefixMatch = file.match(/^(G|soho|tell)/i);
        const prefix = prefixMatch ? prefixMatch[0].toLowerCase() : '';
        let altPrefix = "Wedding";
        if (prefix === 'soho') altPrefix = "Soho";
        if (prefix === 'tell') altPrefix = "Tell Love";

        return {
          src: `/images/gallery/${file}`,
          alt: `${altPrefix} Photo`,
        };
      });
  } catch (error: unknown) {
    // Log any errors encountered during directory reading.
    // The type 'unknown' is used for caught errors as per TypeScript best practices,
    // then narrowed down if specific properties are accessed.
    if (error instanceof Error) {
      console.error("Failed to read gallery directory:", error.message);
    } else {
      console.error("An unknown error occurred while reading gallery directory:", error);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-cream">
      {/* <NoticePopup /> */}
      {/* FallingHearts component provides the decorative falling heart effect */}
      <FallingHearts /> {/* FallingPetals -> FallingHearts로 변경 */}
      <Hero />

      <div className="max-w-md mx-auto w-full bg-white shadow-xl min-h-screen snap-start pb-32">
        <Invitation />

        <WeddingInfo />

        <div id="rsvp-section">
          <RsvpSection />
        </div>

        {/* Gallery Section */}
        <section className="py-20 px-6 text-center bg-[#F8F6F2]" hidden={false}>
          <SectionHeader title="갤러리" />
          <Gallery initialImages={initialImages} />
          <div className="mt-8 text-center" hidden={true}>
            <a
              href="/our-gallery"
              className="font-pretendard inline-block border-b border-charcoal text-charcoal text-sm pb-1 hover:text-gold hover:border-gold transition-colors font-serif"
            >
              하객 갤러리 보러가기 →
            </a>
          </div>
        </section>

        {/* Location Section */}
        <section id="map-section" className="py-16 px-6 text-center">
          <SectionHeader title="오시는 길" />
          <Map />
        </section>

        <Account />

        <Guestbook />

        <ShareButton />
        {/* Keeping this commented out or replace with simple button if ShareButton is not adapted yet.
          The previous code had a simple button. I'll stick to the simple button for now to avoid issues with the old component.*/}
        {/* <section className="py-16 px-6 flex justify-center">
          <button className="bg-charcoal text-white px-8 py-3 rounded-full hover:bg-gold transition-colors duration-300 font-serif">
            청첩장 공유하기
          </button>
        </section> */}

        <footer className="py-8 text-center text-gray-400 text-sm font-serif">
          <p>
            <a href="/rsvp-admin" className="hover:text-gray-500 transition-colors cursor-default">©</a> 2026 <a href="/secret-gallery" className="hover:text-gray-500 transition-colors cursor-default">종열 & 성애</a>. All rights <a href="/our-gallery" className="hover:text-gray-500 transition-colors cursor-default">reserved.</a>
          </p>
        </footer>
      </div>
    </div>
  );
}
```