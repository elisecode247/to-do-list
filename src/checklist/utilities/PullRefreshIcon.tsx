const PullToRefreshIcon = ({ pullDistance }: { pullDistance: number }) => {
        const opacity = Math.min(pullDistance / 100, 1); // fully visible by 100px pull

    return (
        <div
            className={`pull-to-refresh-icon-container ${pullDistance > 50 ? "pulling" : ""}`}
            style={{ "--opacity": opacity } as React.CSSProperties}
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

export default PullToRefreshIcon;
