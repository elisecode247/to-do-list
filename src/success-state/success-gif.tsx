import { useEffect, useState } from "react";
import './success-gif.css';
import { API_TENOR_URL } from 'src/app/constants';

type SuccessGifProps = {
    onClose: () => void;
    query?: string;      // GIF search term
    maxResults?: number; // number of GIFs to fetch
    fallbackDuration?: number; // ms to auto-close if GIF duration not available
};

function getRandomSuccessKeyword(): "success" | "nod" | "hurray" {
    const options: ("success" | "nod" | "hurray")[] = ["success", "nod", "hurray"];
    const randomIndex = Math.floor(Math.random() * options.length);
    return options[randomIndex];
}

function SuccessGif({
    onClose
}: SuccessGifProps) {
    const [gifUrl, setGifUrl] = useState<string | null>(null);
    const [gifDuration, setGifDuration] = useState<number | null>(null);
    const query = getRandomSuccessKeyword();
    const maxResults = 5;
    const fallbackDuration = 10000;

    useEffect(() => {
        let timeoutId: number | null = null;

        async function loadGif() {
            try {
                const res = await fetch(`${API_TENOR_URL}/api/search-gif?q=${encodeURIComponent(query)}&limit=${maxResults}`);
                if (!res.ok) throw new Error("Failed to fetch GIF from backend");

                const data = await res.json();
                const results = data.results;
                if (!results || !results.length) return;

                // Pick a random GIF
                const randomGif = results[Math.floor(Math.random() * results.length)];
                const url = randomGif.media_formats?.gif?.url ?? randomGif.url ?? null;
                const duration = randomGif.media_formats?.gif?.duration ?? fallbackDuration / 1000; // seconds

                if (url) {
                    setGifUrl(url);
                    setGifDuration(duration * 1000); // convert to ms
                }
            } catch (err) {
                console.error("Failed to load success GIF:", err);
            }
        }

        loadGif();

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, []);

    // Start auto-close timer once gifDuration is set
    useEffect(() => {
        if (!gifUrl || gifDuration === null) return;
        const timeoutId = window.setTimeout(onClose, gifDuration);
        return () => clearTimeout(timeoutId);
    }, [gifUrl, gifDuration, onClose]);

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
