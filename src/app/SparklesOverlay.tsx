import { type FC } from 'react';

const SparklesOverlay: FC = () => {

    return (
        <div className="sparkles">
            {Array.from({ length: 20 }).map((_, i) => (
                <span key={i} className="sparkle" style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 0.5}s`,
                    animationDuration: `${1 + Math.random() * 1}s`
                }} />
            ))}
        </div>
    )
};

export default SparklesOverlay;
