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