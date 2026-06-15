import { type FC, useEffect, useRef, useState } from 'react';

type Firefly = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    glow: number;
    phase: number;
    flickerSpeed: number;
};

const PARTICLE_COUNT = 26;

const getIsNatureTheme = () =>
    document.documentElement.getAttribute('data-theme-style') === 'nature';

const createFireflies = (width: number, height: number): Firefly[] =>
    Array.from({ length: PARTICLE_COUNT }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        radius: 1.5 + Math.random() * 2.6,
        glow: 4 + Math.random() * 10,
        phase: Math.random() * Math.PI * 2,
        flickerSpeed: 0.001 + Math.random() * 0.001,
    }));

const NatureFirefliesCanvas: FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isNatureTheme, setIsNatureTheme] = useState(false);
    const [reduceMotion, setReduceMotion] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

        const sync = () => {
            setIsNatureTheme(getIsNatureTheme());
            setReduceMotion(mediaQuery.matches);
        };

        sync();

        const observer = new MutationObserver(() => {
            setIsNatureTheme(getIsNatureTheme());
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme-style'],
        });

        const onMotionChange = () => {
            setReduceMotion(mediaQuery.matches);
        };

        mediaQuery.addEventListener('change', onMotionChange);

        return () => {
            observer.disconnect();
            mediaQuery.removeEventListener('change', onMotionChange);
        };
    }, []);

    useEffect(() => {
        if (!isNatureTheme || reduceMotion) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
        let width = 0;
        let height = 0;
        let frameId = 0;
        let fireflies: Firefly[] = [];

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = Math.floor(width * dpr);
            canvas.height = Math.floor(height * dpr);
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            context.setTransform(dpr, 0, 0, dpr, 0, 0);
            fireflies = createFireflies(width, height);
        };

        const draw = (time: number) => {
            context.clearRect(0, 0, width, height);

            for (const firefly of fireflies) {
                firefly.x += firefly.vx + Math.sin(time * 0.00035 + firefly.phase) * 0.18;
                firefly.y += firefly.vy + Math.cos(time * 0.00027 + firefly.phase) * 0.14;

                if (firefly.x < -40) firefly.x = width + 40;
                if (firefly.x > width + 40) firefly.x = -40;
                if (firefly.y < -40) firefly.y = height + 40;
                if (firefly.y > height + 40) firefly.y = -40;

                const flicker = 0.25 + Math.abs(Math.sin(time * firefly.flickerSpeed + firefly.phase)) * 0.95;
                const glowRadius = firefly.glow * (0.6 + flicker * 0.7);
                const alpha = 0.12 + flicker * 0.34;

                const gradient = context.createRadialGradient(
                    firefly.x,
                    firefly.y,
                    0,
                    firefly.x,
                    firefly.y,
                    glowRadius,
                );

                gradient.addColorStop(0, `rgba(252, 211, 77, ${alpha})`);
                gradient.addColorStop(0.45, `rgba(250, 204, 21, ${alpha * 0.52})`);
                gradient.addColorStop(1, 'rgba(250, 204, 21, 0)');

                context.fillStyle = gradient;
                context.beginPath();
                context.arc(firefly.x, firefly.y, glowRadius, 0, Math.PI * 2);
                context.fill();

                context.fillStyle = `rgba(255, 244, 170, ${Math.min(0.95, alpha + 0.4)})`;
                context.beginPath();
                context.arc(firefly.x, firefly.y, firefly.radius, 0, Math.PI * 2);
                context.fill();
            }

            frameId = window.requestAnimationFrame(draw);
        };

        resize();
        frameId = window.requestAnimationFrame(draw);
        window.addEventListener('resize', resize);

        return () => {
            window.cancelAnimationFrame(frameId);
            window.removeEventListener('resize', resize);
            context.clearRect(0, 0, width, height);
        };
    }, [isNatureTheme, reduceMotion]);

    if (!isNatureTheme || reduceMotion) {
        return null;
    }

    return <canvas aria-hidden="true" className="nature-fireflies-canvas" ref={canvasRef} />;
};

export default NatureFirefliesCanvas;
