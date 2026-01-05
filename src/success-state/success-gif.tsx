import { useEffect, useState } from "react";
import { searchTenorGifs } from "./search-tenor";
import './success-gif.css';

type SuccessGifProps = {
    onClose: () => void;
    duration?: number; // fallback duration in milliseconds
};

function getRandomSuccessKeyword(): "success" | "nod" | "hurray" {
    const options: ("success" | "nod" | "hurray")[] = ["success", "nod", "hurray"];
    const randomIndex = Math.floor(Math.random() * options.length);
    return options[randomIndex];
}


function SuccessGif({ onClose, duration = 5000 }: SuccessGifProps) {
    const [gifUrl, setGifUrl] = useState<string | null>(null);

    useEffect(() => {
        let timeoutId: number;

        searchTenorGifs(getRandomSuccessKeyword(), 1)
            .then(results => {
                if (!results || !results.length) return;

                // Pick a random GIF
                const randomIndex = Math.floor(Math.random() * results.length);
                const gif = results[randomIndex];

                // Get the GIF duration (seconds) and convert to ms
                const gifDurationMs = (gif.media_formats?.gif?.duration ?? duration / 1000) * 1000;

                // Pick preferred format
                const url =
                    gif.media_formats?.gif?.url ??
                    gif.url ??
                    gif.media_formats?.tinygif?.url ??
                    gif.media_formats?.nanogif?.url;

                if (url) setGifUrl(url);

                // Auto-close after the GIF duration
                timeoutId = window.setTimeout(onClose, Math.max(duration, gifDurationMs));
            })
            .catch(err => {
                console.error("Failed to load success GIF:", err);
                // fallback: close after default duration
                timeoutId = window.setTimeout(onClose, duration);
            });

        return () => clearTimeout(timeoutId);
    }, [onClose, duration]);

    if (!gifUrl) return null;

    return (
        <div className="success-gif-overlay">
            <button
                className="success-gif-close"
                onClick={onClose}
                aria-label="Close"
            >
                ✕
            </button>
            <img src={gifUrl} alt="Success" />
        </div>
    );
}

export default SuccessGif;
