import { type FC, useState } from 'react';

type SparkleStyle = {
    left: string;
    animationDelay: string;
    animationDuration: string;
};

const createSparkles = (count: number): SparkleStyle[] =>
    Array.from({ length: count }).map(() => ({
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 0.5}s`,
        animationDuration: `${1 + Math.random() * 1}s`,
    }));

const SparklesOverlay: FC = () => {
    const [sparkles] = useState(() => createSparkles(20));

    return (
        <div className="sparkles">
            {sparkles.map((sparkle, i) => (
                <span
                    key={i}
                    className="sparkle"
                    style={sparkle}
                />
            ))}
        </div>
    );
};

export default SparklesOverlay;
