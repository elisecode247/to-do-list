import { type CSSProperties, type FC, useState } from 'react';
import { useTheme } from 'src/themes/use-theme';
import type { ThemeStyle } from 'src/themes/types';

type ParticleStyle = CSSProperties & {
    '--particle-size': string;
    '--particle-drift': string;
    '--particle-rotation': string;
    '--wisp-width': string;
};

const createParticles = (count: number): ParticleStyle[] =>
    Array.from({ length: count }).map(() => ({
        left: `${Math.random() * 100}%`,
        top: `${8 + Math.random() * 84}%`,
        animationDelay: `${Math.random() * 0.4}s`,
        animationDuration: `${1.9 + Math.random() * 1.1}s`,
        '--particle-size': `${5 + Math.random() * 9}px`,
        '--particle-drift': `${-70 + Math.random() * 140}px`,
        '--particle-rotation': `${240 + Math.random() * 620}deg`,
        '--wisp-width': `${55 + Math.random() * 85}px`,
    }));

const themeAnimation = {
    space: 'sparkles',
    winter: 'snowflakes',
    nature: 'leaves',
    calm: 'breeze',
    ocean: 'bubbles',
    custom: 'confetti',
} satisfies Record<ThemeStyle, string>;

const SparklesOverlay: FC = () => {
    const [particles] = useState(() => createParticles(26));
    const { style } = useTheme();
    const animationClass = themeAnimation[style];

    return (
        <div
            aria-hidden="true"
            className={`theme-celebration ${animationClass}`}
            data-theme-animation={style}
        >
            {particles.map((particle, index) => (
                <span
                    key={index}
                    className="theme-particle"
                    style={particle}
                />
            ))}
        </div>
    );
};

export default SparklesOverlay;
