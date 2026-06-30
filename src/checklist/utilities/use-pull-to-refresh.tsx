import { useState, useEffect, useRef, useCallback } from 'react';
import './use-pull-to-refresh.css';

export const usePullToRefresh = (refreshData: () => void) => {
    const [pullDistance, setPullDistance] = useState(0);
    const refreshContainerRef = useRef<HTMLDivElement>(null);
    const startPoint = useRef<number | null>(null);

    const triggerRefresh = useCallback(() => {
        if (!refreshContainerRef.current) {
            return;
        }
        refreshData();
    }, [refreshData]);

    const pullStart = useCallback((e: TouchEvent) => {
        if (refreshContainerRef.current?.scrollTop !== 0) {
            return;
        }
        const { clientY } = e.targetTouches[0];
        startPoint.current = clientY;
    }, []);
    const pull = useCallback((e: TouchEvent) => {
        if (startPoint.current === null) return;
        const touch = e.targetTouches[0];
        const { clientY } = touch;
        const pullLength = startPoint.current < clientY ? clientY - startPoint.current : 0;
        setPullDistance(pullLength);
    }, []);

    const endPull = useCallback(() => {
        const shouldRefresh = pullDistance > 100;
        startPoint.current = null;
        setPullDistance(0);
        if (shouldRefresh) triggerRefresh();
    }, [pullDistance, triggerRefresh]);

    useEffect(() => {
        const refreshContCurrent = refreshContainerRef.current;
        refreshContCurrent?.addEventListener("touchstart", pullStart);
        refreshContCurrent?.addEventListener("touchmove", pull);
        refreshContCurrent?.addEventListener("touchend", endPull);
        return () => {
            refreshContCurrent?.removeEventListener("touchstart", pullStart);
            refreshContCurrent?.removeEventListener("touchmove", pull);
            refreshContCurrent?.removeEventListener("touchend", endPull);
        };
    }, [endPull, pull, pullStart]);

    const PullToRefresh = () => {
        return (
            <div
                className={`pull-to-refresh-icon-container ${pullDistance > 50 ? "pulling" : ""}`}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="pull-refresh-icon"
                    style={{ "--rotation": `${pullDistance}deg` } as React.CSSProperties}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                    />
                </svg>
            </div>
        );
    }

    return {
        refreshContainerRef,
        pullRefreshContainerClassName: "pull-to-refresh-container",
        PullToRefresh,
        pullDistance
    }
}
