import { useEffect, useRef } from "react";
import "./ProgressBar.css";

function ProgressBar({ progress }: { progress: number }) {
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (fillRef.current) {
      fillRef.current.style.width = `${progress}%`;
    }
  }, [progress]);

  return (
    <div
      className="progress-bar"
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="progress-bar__fill" ref={fillRef} />
    </div>
  );
}
export default ProgressBar;
