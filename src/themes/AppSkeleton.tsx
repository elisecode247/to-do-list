const SkeletonAppPage = () => {
    return (
        <div className='app-skeleton' aria-label='Loading app'>
            <aside className='app-skeleton-left-panel'>
                <div className='app-skeleton-shimmer app-skeleton-brand' />
                <div className='app-skeleton-nav'>
                    <div className='app-skeleton-shimmer app-skeleton-nav-item' />
                    <div className='app-skeleton-shimmer app-skeleton-nav-item app-skeleton-nav-item-short' />
                    <div className='app-skeleton-shimmer app-skeleton-nav-item' />
                    <div className='app-skeleton-shimmer app-skeleton-nav-item app-skeleton-nav-item-mid' />
                </div>
            </aside>

            <main className='app-skeleton-main'>
                <header className='app-skeleton-header'>
                    <div className='app-skeleton-shimmer app-skeleton-title' />
                    <div className='app-skeleton-shimmer app-skeleton-action' />
                </header>
                <section className='app-skeleton-task-list'>
                    <div className='app-skeleton-task-row'>
                        <div className='app-skeleton-shimmer app-skeleton-checkbox' />
                        <div className='app-skeleton-shimmer app-skeleton-task-text app-skeleton-task-text-long' />
                        <div className='app-skeleton-shimmer app-skeleton-task-meta' />
                    </div>
                    <div className='app-skeleton-task-row'>
                        <div className='app-skeleton-shimmer app-skeleton-checkbox' />
                        <div className='app-skeleton-shimmer app-skeleton-task-text' />
                        <div className='app-skeleton-shimmer app-skeleton-task-meta' />
                    </div>
                    <div className='app-skeleton-task-row'>
                        <div className='app-skeleton-shimmer app-skeleton-checkbox' />
                        <div className='app-skeleton-shimmer app-skeleton-task-text app-skeleton-task-text-mid' />
                        <div className='app-skeleton-shimmer app-skeleton-task-meta' />
                    </div>
                    <div className='app-skeleton-task-row'>
                        <div className='app-skeleton-shimmer app-skeleton-checkbox' />
                        <div className='app-skeleton-shimmer app-skeleton-task-text app-skeleton-task-text-short' />
                        <div className='app-skeleton-shimmer app-skeleton-task-meta' />
                    </div>
                    <div className='app-skeleton-task-row'>
                        <div className='app-skeleton-shimmer app-skeleton-checkbox' />
                        <div className='app-skeleton-shimmer app-skeleton-task-text app-skeleton-task-text-long' />
                        <div className='app-skeleton-shimmer app-skeleton-task-meta' />
                    </div>
                </section>
            </main>
        </div>
    );
};

export default SkeletonAppPage;
