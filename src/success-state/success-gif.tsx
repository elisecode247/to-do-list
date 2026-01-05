import { useEffect, useState } from "react";
import { searchKlipyGifs } from "./search-klipy";
import './success-gif.css';

type SuccessGifProps = {
  onClose: () => void;
  duration?: number; // ms
};

function SuccessGif({ onClose, duration = 4000 }: SuccessGifProps) {
  const [gifUrl, setGifUrl] = useState<string | null>(null);

  useEffect(() => {
    let timeoutId: number | null = null;

    searchKlipyGifs("success", 10)
      .then(results => {
        if (!results.length) return;
        const random = results[Math.floor(Math.random() * results.length)];
        setGifUrl(random.media.gif.url);
      });

    timeoutId = window.setTimeout(onClose, duration);

    return () => {
        clearTimeout(timeoutId);
    }
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
