const SkeletonAppPage = () => {
    return (
        <div className='app_skeleton' aria-label='Loading app'>
            <aside className='app_skeleton_left-panel'>
                <div className='app_skeleton_shimmer app_skeleton_brand' />
                <div className='app_skeleton_nav'>
                    <div className='app_skeleton_shimmer app_skeleton_nav-item' />
                    <div className='app_skeleton_shimmer app_skeleton_nav-item app_skeleton_nav-item-short' />
                    <div className='app_skeleton_shimmer app_skeleton_nav-item' />
                    <div className='app_skeleton_shimmer app_skeleton_nav-item app_skeleton_nav-item-mid' />
                </div>
            </aside>

            <main className='app_skeleton_main'>
                <header className='app_skeleton_header'>
                    <div className='app_skeleton_shimmer app_skeleton_title' />
                    <div className='app_skeleton_shimmer app_skeleton_action' />
                </header>
                <section className='app_skeleton_task-list'>
                    <div className='app_skeleton_task-row'>
                        <div className='app_skeleton_shimmer app_skeleton_checkbox' />
                        <div className='app_skeleton_shimmer app_skeleton_task-text app_skeleton_task-text-long' />
                        <div className='app_skeleton_shimmer app_skeleton_task-meta' />
                    </div>
                    <div className='app_skeleton_task-row'>
                        <div className='app_skeleton_shimmer app_skeleton_checkbox' />
                        <div className='app_skeleton_shimmer app_skeleton_task-text' />
                        <div className='app_skeleton_shimmer app_skeleton_task-meta' />
                    </div>
                    <div className='app_skeleton_task-row'>
                        <div className='app_skeleton_shimmer app_skeleton_checkbox' />
                        <div className='app_skeleton_shimmer app_skeleton_task-text app_skeleton_task-text-mid' />
                        <div className='app_skeleton_shimmer app_skeleton_task-meta' />
                    </div>
                    <div className='app_skeleton_task-row'>
                        <div className='app_skeleton_shimmer app_skeleton_checkbox' />
                        <div className='app_skeleton_shimmer app_skeleton_task-text app_skeleton_task-text-short' />
                        <div className='app_skeleton_shimmer app_skeleton_task-meta' />
                    </div>
                    <div className='app_skeleton_task-row'>
                        <div className='app_skeleton_shimmer app_skeleton_checkbox' />
                        <div className='app_skeleton_shimmer app_skeleton_task-text app_skeleton_task-text-long' />
                        <div className='app_skeleton_shimmer app_skeleton_task-meta' />
                    </div>
                </section>
            </main>
        </div>
    );
};

export default SkeletonAppPage;
