import React from 'react';
import './guide.css';

const Guide: React.FC<{ onGuideOpen: React.Dispatch<React.SetStateAction<boolean>> }> = ({ onGuideOpen }) => {
    return (
        <div className="guide-popup-overlay" onClick={() => onGuideOpen(false)}>
            <div className="guide-popup" onClick={(e) => e.stopPropagation()}>
                <button
                    className="guide-popup-close"
                    onClick={() => onGuideOpen(false)}
                    aria-label="Close guide"
                >
                    ✕
                </button>
                <div className="guide-popup-content">
                    <h2 className="guide-popup-title">How to write an entry</h2>

                    <div className="guide">
                        <div className="guide-left">
                            <span className="guide-q1">Procrastinating?</span>
                            <span className="guide-q2">Doom-scrolling?</span>
                            <span className="guide-q3">In between tasks? Write it down.</span>
                        </div>

                        <div className="guide-vr"></div>

                        <div className="guide-right">
                            <div className="guide-step">
                                <span className="guide-step-num">1</span>
                                <span className="guide-step-label">What you just finished</span>
                                <span className="guide-step-sub">Close the loop.</span>
                            </div>
                            <div className="guide-step">
                                <span className="guide-step-num">2</span>
                                <span className="guide-step-label">How you're feeling</span>
                                <span className="guide-step-sub">Right now.</span>
                            </div>
                            <div className="guide-step">
                                <span className="guide-step-num">3</span>
                                <span className="guide-step-label">What you'll do next</span>
                                <span className="guide-step-sub">One thing. Go.</span>
                            </div>
                        </div>
                    </div>
                    <div className="guide-popup-hint">
                        <span className="guide-popup-hint-icon">!</span>
                        If distracted — log it, then return
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Guide;
