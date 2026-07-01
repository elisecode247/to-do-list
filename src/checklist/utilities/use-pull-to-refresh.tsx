import { useState, useEffect, useRef, useCallback } from 'react';
import PullToRefreshIcon from './PullRefreshIcon';
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

    return {
        refreshContainerRef,
        pullRefreshContainerClassName: "pull-to-refresh-container",
        PullToRefresh: () => <PullToRefreshIcon pullDistance={pullDistance} />,
        pullDistance
    }
}
