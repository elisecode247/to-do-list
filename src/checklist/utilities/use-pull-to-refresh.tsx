import { useState, useEffect, useRef, useCallback } from 'react';
import PullToRefreshIcon from './PullRefreshIcon';
import './use-pull-to-refresh.css';

export const usePullToRefresh = (refreshData: () => void, isEnabled = true) => {
    const [pullDistance, setPullDistance] = useState(0);
    const refreshContainerRef = useRef<HTMLDivElement>(null);
    const startPoint = useRef<number | null>(null);
    const MAX_PULL_DISTANCE = 140;

    const dampedPullDistance = useCallback((rawPullDistance: number) => {
        const clamped = Math.max(0, rawPullDistance);
        if (clamped <= 80) {
            return clamped;
        }

        // Add resistance after the first segment so pulling feels natural.
        return Math.min(80 + (clamped - 80) * 0.35, MAX_PULL_DISTANCE);
    }, []);

    const triggerRefresh = useCallback(() => {
        if (!refreshContainerRef.current) {
            return;
        }
        refreshData();
    }, [refreshData]);

    const pullStart = useCallback((e: TouchEvent) => {
        if (!isEnabled) {
            return;
        }

        if (refreshContainerRef.current?.scrollTop !== 0) {
            return;
        }
        const { clientY } = e.targetTouches[0];
        startPoint.current = clientY;
    }, [isEnabled]);

    const pull = useCallback((e: TouchEvent) => {
        if (!isEnabled) {
            return;
        }

        if (startPoint.current === null) return;

        if (refreshContainerRef.current?.scrollTop !== 0) {
            return;
        }

        const touch = e.targetTouches[0];
        const { clientY } = touch;
        const pullLength = startPoint.current < clientY ? clientY - startPoint.current : 0;

        if (pullLength > 0) {
            e.preventDefault();
        }

        setPullDistance(dampedPullDistance(pullLength));
    }, [dampedPullDistance, isEnabled]);

    const endPull = useCallback(() => {
        if (!isEnabled) {
            startPoint.current = null;
            setPullDistance(0);
            return;
        }

        const shouldRefresh = pullDistance > 100;
        startPoint.current = null;
        setPullDistance(0);
        if (shouldRefresh) triggerRefresh();
    }, [isEnabled, pullDistance, triggerRefresh]);

    useEffect(() => {
        if (!isEnabled) {
            return;
        }

        const refreshContCurrent = refreshContainerRef.current;
        refreshContCurrent?.addEventListener("touchstart", pullStart);
        refreshContCurrent?.addEventListener("touchmove", pull, { passive: false });
        refreshContCurrent?.addEventListener("touchend", endPull);
        refreshContCurrent?.addEventListener("touchcancel", endPull);
        return () => {
            refreshContCurrent?.removeEventListener("touchstart", pullStart);
            refreshContCurrent?.removeEventListener("touchmove", pull);
            refreshContCurrent?.removeEventListener("touchend", endPull);
            refreshContCurrent?.removeEventListener("touchcancel", endPull);
        };
    }, [endPull, pull, pullStart]);

    return {
        refreshContainerRef,
        pullRefreshContainerClassName: isEnabled ? "pull-to-refresh-container" : "",
        PullToRefresh: () => isEnabled ? <PullToRefreshIcon pullDistance={pullDistance} /> : null,
        pullDistance
    }
}
