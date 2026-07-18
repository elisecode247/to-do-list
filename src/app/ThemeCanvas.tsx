import { type FC, useEffect, useRef, useState } from 'react';

// ---------------------------------------------------------------------------
// Theme definition contract
// ---------------------------------------------------------------------------

interface ThemeDefinition<T> {
    /** Number of particles to spawn. */
    particleCount: number;
    /** Build the initial particle set for the given viewport size. */
    create: (width: number, height: number) => T[];
    /** Mutate particles in place for this frame. */
    step: (particles: T[], time: number, width: number, height: number) => void;
    /** Paint the current particle state. */
    draw: (ctx: CanvasRenderingContext2D, particles: T[], time: number, width: number, height: number) => void;
}

function defineTheme<T>(def: ThemeDefinition<T>): ThemeDefinition<T> {
    return def as ThemeDefinition<T>;
}

// ---------------------------------------------------------------------------
// Theme: nature (fireflies) — behavior preserved from the original component
// ---------------------------------------------------------------------------

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

const natureTheme: ThemeDefinition<Firefly> = defineTheme<Firefly>({
    particleCount: 26,

    create: (width, height) =>
        Array.from({ length: natureTheme.particleCount }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.2,
            vy: (Math.random() - 0.5) * 0.2,
            radius: 1.5 + Math.random() * 2.6,
            glow: 4 + Math.random() * 10,
            phase: Math.random() * Math.PI * 2,
            flickerSpeed: 0.001 + Math.random() * 0.001,
        })),

    step: (fireflies, time, width, height) => {
        for (const firefly of fireflies) {
            firefly.x += firefly.vx + Math.sin(time * 0.00035 + firefly.phase) * 0.18;
            firefly.y += firefly.vy + Math.cos(time * 0.00027 + firefly.phase) * 0.14;

            if (firefly.x < -40) firefly.x = width + 40;
            if (firefly.x > width + 40) firefly.x = -40;
            if (firefly.y < -40) firefly.y = height + 40;
            if (firefly.y > height + 40) firefly.y = -40;
        }
    },

    draw: (context, fireflies, time) => {
        for (const firefly of fireflies) {
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
    },
});

// ---------------------------------------------------------------------------
// Theme: winter (falling snow) — example of a second theme
// ---------------------------------------------------------------------------

type Snowflake = {
    x: number;
    y: number;
    radius: number;
    fallSpeed: number;
    drift: number;
    phase: number;
    opacity: number;
};

const winterTheme: ThemeDefinition<Snowflake> = defineTheme<Snowflake>({
    particleCount: 60,

    create: (width, height) =>
        Array.from({ length: winterTheme.particleCount }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: 1 + Math.random() * 2.5,
            fallSpeed: 0.25 + Math.random() * 0.5,
            drift: 0.3 + Math.random() * 0.5,
            phase: Math.random() * Math.PI * 2,
            opacity: 0.3 + Math.random() * 0.5,
        })),

    step: (flakes, time, width, height) => {
        for (const flake of flakes) {
            flake.y += flake.fallSpeed;
            flake.x += Math.sin(time * 0.0006 + flake.phase) * flake.drift * 0.05;

            if (flake.y > height + 10) {
                flake.y = -10;
                flake.x = Math.random() * width;
            }
            if (flake.x < -10) flake.x = width + 10;
            if (flake.x > width + 10) flake.x = -10;
        }
    },

    draw: (context, flakes) => {
        for (const flake of flakes) {
            context.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
            context.beginPath();
            context.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
            context.fill();
        }
    },
});

// ---------------------------------------------------------------------------
// Theme: space (twinkling stars) — example of a third theme
// ---------------------------------------------------------------------------

type Star = {
    x: number;
    y: number;
    radius: number;
    phase: number;
    twinkleSpeed: number;
};

const spaceTheme: ThemeDefinition<Star> = defineTheme<Star>({
    particleCount: 80,

    create: (width, height) =>
        Array.from({ length: spaceTheme.particleCount }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: 0.6 + Math.random() * 1.4,
            phase: Math.random() * Math.PI * 2,
            twinkleSpeed: 0.0006 + Math.random() * 0.0012,
        })),

    step: () => {
        // Stars are static; only their twinkle (handled in draw) animates.
    },

    draw: (context, stars, time) => {
        for (const star of stars) {
            const twinkle = 0.3 + Math.abs(Math.sin(time * star.twinkleSpeed + star.phase)) * 0.7;
            context.fillStyle = `rgba(226, 232, 255, ${twinkle})`;
            context.beginPath();
            context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            context.fill();
        }
    },
});

// ---------------------------------------------------------------------------
// Theme: ocean (underwater sun rays + drifting marine snow)
// ---------------------------------------------------------------------------
type OceanSpeck = {
    x: number;
    y: number;
    radius: number;
    fallSpeed: number;
    drift: number;
    phase: number;
    opacity: number;
};

type OceanSunRay = {
    xPct: number;
    angleDeg: number;
    width: number;
    opacity: number;
    speed: number;
    phase: number;
};
function createSunRays(count: number): OceanSunRay[] {
    const sourceXPct = 0.58; // sun position, 0 = left, 1 = right
    const sourceYPct = -.2; // above viewport

    return Array.from({ length: count }, (_, i) => {
        const targetXPct =
            sourceXPct +
            ((i / Math.max(count - 1, 1)) - 0.5) * 1.4;

        const dx = targetXPct - sourceXPct;
        const dy = 1 - sourceYPct;

        return {
            xPct: sourceXPct,
            angleDeg: Math.atan2(dx, dy) * (360 / Math.PI),
            width: 220 + (Math.random() - 0.9) * 10,
            opacity: 0.03 + Math.random() * 0.03,
            speed: 0.06 + Math.random() * 0.14,
            phase: Math.random() * Math.PI * 2,
        };
    });
}
const OCEAN_LAYER_INSET = 0.2;
const OCEAN_SUN_RAYS = createSunRays(14);

const drawOceanLightField = (
    context: CanvasRenderingContext2D,
    width: number,
    height: number,
    time: number,
) => {
    const layerLeft = -OCEAN_LAYER_INSET * width;
    const layerTop = -OCEAN_LAYER_INSET * height;
    const layerWidth = width * (1 + OCEAN_LAYER_INSET * 2);
    const layerHeight = height * (1 + OCEAN_LAYER_INSET * 2);

    context.save();
    context.globalCompositeOperation = 'screen';



    for (const ray of OCEAN_SUN_RAYS) {
        const t = time * 0.005 * ray.speed + ray.phase;

        const drift = Math.sin(t * 0.95) * 30;
        const sourceX = layerLeft + ray.xPct * layerWidth + drift;
        const sourceY = layerTop * 0.95;

        const angleRad = (ray.angleDeg * Math.PI) / 180 + Math.sin(t * 0.1) * 0.01;

        const length = layerHeight * 3.8;
        const rayWidth = ray.width * (0.9 + Math.sin(t * 0.08) * 0.18);
        const alpha = ray.opacity * (0.75 + Math.sin(t) * 0.25);

        context.save();
        context.translate(sourceX, sourceY);
        context.rotate(angleRad);
        const gradient = context.createLinearGradient(-rayWidth, 0, rayWidth, 0);
        gradient.addColorStop(0, 'rgba(180, 245, 255, 0)');
        gradient.addColorStop(0.38, 'rgba(180, 245, 255, 0)');
        gradient.addColorStop(0.5, `rgba(117, 240, 250, .1`);
        gradient.addColorStop(0.62, 'rgba(180, 245, 255, 0)');
        gradient.addColorStop(1, 'rgba(180, 245, 255, 0)');

        const fade = context.createLinearGradient(0, 0, 0, length);
        fade.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        fade.addColorStop(0.35, `rgba(255, 255, 255, ${alpha * 0.25})`);
        fade.addColorStop(.8, 'rgba(255, 255, 255, 0)');

        context.fillStyle = gradient;
        context.beginPath();
        context.moveTo(-rayWidth * 0.3, 0);
        context.lineTo(rayWidth * 0.9, 0);
        context.lineTo(rayWidth * 2.1, length);
        context.lineTo(-rayWidth * 0.1, length);
        context.closePath();
        context.fill();
        context.restore();

    }

};

const oceanTheme: ThemeDefinition<OceanSpeck> = defineTheme<OceanSpeck>({
    particleCount: 80,

    create: () => {
        return [];
    },

    step: () => {},

    draw: (context, _specks, time, width, height) => {
        drawOceanLightField(context, width, height, time);

    },
});

// ---------------------------------------------------------------------------
// Registry — add new themes here
// ---------------------------------------------------------------------------

interface ThemeRegistry {
    nature: ThemeDefinition<Firefly>;
    winter: ThemeDefinition<Snowflake>;
    space: ThemeDefinition<Star>;
    ocean: ThemeDefinition<OceanSpeck>;
}

type ThemeParticle = Firefly | Snowflake | Star | OceanSpeck;
type RuntimeThemeDefinition = ThemeDefinition<ThemeParticle>;

const THEME_REGISTRY: ThemeRegistry = {
    nature: natureTheme,
    winter: winterTheme,
    space: spaceTheme,
    ocean: oceanTheme,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const getActiveThemeStyle = () => document.documentElement.getAttribute('data-theme-style');
const getEnableParticles = () => document.documentElement.getAttribute('data-graphics');

const ThemeParticlesCanvas: FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [themeStyle, setThemeStyle] = useState<string | null>(null);
    const [reduceMotion, setReduceMotion] = useState(false);
    const [enableParticles, setEnableParticles] = useState(true);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const mobileCanvasQuery = window.matchMedia('(hover: none) and (pointer: coarse)');

        const syncParticles = () => {
            setEnableParticles(getEnableParticles() === 'true' && !mobileCanvasQuery.matches);
        };

        const sync = () => {
            setThemeStyle(getActiveThemeStyle());
            syncParticles();
            setReduceMotion(mediaQuery.matches);
        };

        sync();

        const observer = new MutationObserver(() => {
            setThemeStyle(getActiveThemeStyle());
            syncParticles();
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme-style', 'data-graphics'],
        });

        const onMotionChange = () => setReduceMotion(mediaQuery.matches);
        const onMobileCanvasChange = () => syncParticles();
        mediaQuery.addEventListener('change', onMotionChange);
        mobileCanvasQuery.addEventListener('change', onMobileCanvasChange);

        return () => {
            observer.disconnect();
            mediaQuery.removeEventListener('change', onMotionChange);
            mobileCanvasQuery.removeEventListener('change', onMobileCanvasChange);
        };
    }, []);

    const activeTheme: RuntimeThemeDefinition | undefined =
        themeStyle && themeStyle in THEME_REGISTRY
            ? (THEME_REGISTRY[themeStyle as keyof ThemeRegistry] as RuntimeThemeDefinition)
            : undefined;

    useEffect(() => {
        if (!activeTheme || reduceMotion || !enableParticles) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
        let width = 0;
        let height = 0;
        let frameId = 0;
        let particles = activeTheme.create(0, 0);

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = Math.floor(width * dpr);
            canvas.height = Math.floor(height * dpr);
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
            context.setTransform(dpr, 0, 0, dpr, 0, 0);
            particles = activeTheme.create(width, height);
        };

        const draw = (time: number) => {
            context.clearRect(0, 0, width, height);
            activeTheme.step(particles, time, width, height);
            activeTheme.draw(context, particles, time, width, height);
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
        // activeTheme is derived from themeStyle, so themeStyle is the real dependency
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [themeStyle, reduceMotion, enableParticles]);

    if (!activeTheme || reduceMotion || !enableParticles) {
        return null;
    }

    return <canvas aria-hidden="true" className="theme-particles-canvas" ref={canvasRef} />;
};

export default ThemeParticlesCanvas;
