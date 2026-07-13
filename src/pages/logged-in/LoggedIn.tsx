
import React, { useCallback, useEffect, useMemo, useRef, useState, type SetStateAction } from 'react';
import { useGoogleCalendar } from 'src/google-authorization/use-google-calendar';
import EditTaskForm from 'src/edit-task-form/EditTaskForm';
import type { ChecklistItem } from 'app/types';
import ErrorState from 'src/error-state/ErrorState';
import { useTask } from 'src/app/use-task';
import { useToast } from 'src/toast/use-toast';
import SparklesOverlay from 'src/app/SparklesOverlay';
import { useTheme } from 'src/themes/use-theme';
import AccountMenu from 'app/AccountMenu';
import NewForm from 'src/task-form/NewForm';
import AppToolBar from 'src/app-toolbar/AppToolbar';
import { TABS, TAB_LABELS, type Tab } from 'src/app-toolbar/tabs/types';
import { ALL_CATEGORIES } from 'src/category-select/category-constants';
import { ALL_MODES } from 'src/checklist/constants';
import type { Mode } from 'src/app/types';
import './logged-in.css';
import useIsDesktop from 'src/pages/use-is-desktop';
import { Check, Eye, EyeOff, ListFilter, PencilIcon, Plus } from 'lucide-react';
import IconButton from 'src/components/icon-button/IconButton';
import { JournalProvider } from 'src/journal/journal-provider';
import Journal from 'src/journal/Journal';
import type { GoogleEvent } from 'src/google-authorization/types';
import EditEventForm from 'src/google-authorization/EditEventForm';
import Footer from 'src/footer/Footer';
import { useUserSettings } from 'src/user-settings/use-user-settings';
// preload pages
import('src/pages/user-settings/UserSettings');
import('src/pages/bulk-edit/BulkEdit');
import('src/pages/not-found/NotFound');
import('src/pages/PrivacyPolicy');
import { AnimatePresence, motion } from 'framer-motion';
import TaskContextChecklist from './TaskContextChecklist';

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const LoggedIn: React.FC = () => {
    useTheme();
    const now = new Date();
    const dayOfWeekName = daysOfWeek[now.getDay()] + ", ";
    const { showToast } = useToast();
    const {
        isLoading,
        taskError,
        loadTasks,
        updateItem,
        loadDate,
        itemLength,
        isUpdatedDate
    } = useTask();
    const { categories } = useUserSettings();
    const [editingItem, setEditingItem] = useState<ChecklistItem | GoogleEvent | null>(null);
    const [activeTab, setActiveTab] = useState(TABS.today);
    const [hideCompleted, setHideCompleted] = useState(true);
    const [modeFilter, setModeFilter] = useState<Mode | typeof ALL_MODES>(ALL_MODES);
    const [filterCategory, setFilterCategory] = useState<string>(ALL_CATEGORIES);
    const isDesktop = useIsDesktop();
    const [leftOpen, setLeftOpen] = useState(isDesktop ? true : false);
    const [rightOpen, setRightOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const lastUpdatedRaw = loadDate && 'current' in loadDate ? loadDate.current : null;
    const lastUpdatedDate = lastUpdatedRaw ? new Date(lastUpdatedRaw) : null;
    const { updateEvent } = useGoogleCalendar();
    async function handleEventSave(saveItem: GoogleEvent) {
        setIsSaving(true);
        try {
            await updateEvent(saveItem);
            setEditingItem(null);
            showToast('Event updated successfully', 'success');
        } catch (error) {
            if (error instanceof Error && error?.message) {
                showToast(`Failed to update event: ${error.message}`, 'error');
            } else {
                showToast('Failed to update event. Please try again.', 'error');
            }
        } finally {
            setIsSaving(false);
            setRightOpen(false);
        }
    }

    async function handleSave(saveItem: ChecklistItem) {
        if (!editingItem) return;
        setIsSaving(true);
        try {
            await updateItem(saveItem);
            setEditingItem(null);
            showToast('Task updated successfully', 'success');
        } catch (error) {
            if (error instanceof Error && error?.message) {
                showToast(`Failed to update task: ${error.message}`, 'error');
            } else {
                showToast('Failed to update task. Please try again.', 'error');
            }
        } finally {
            setIsSaving(false);
            setRightOpen(false);
        }
    }

    const sparkles = <SparklesOverlay />;

    function handleEditItem(item: ChecklistItem) {
        setEditingItem(item);
        setRightOpen(true);
    }

    function handleEditEvent(item: GoogleEvent) {
        setEditingItem(item);
        setRightOpen(true);
    }

    const handleTabChange = (tab: SetStateAction<Tab>) => {
        setActiveTab(tab);
    }
    const isSecondaryTabActive = activeTab === TABS.hidden || activeTab === TABS.archived;
    const mobileTabs: Tab[] = useMemo(() => {
        return isSecondaryTabActive
            ? [TABS.journal, TABS.priority, TABS.today, activeTab]
            : [TABS.journal, TABS.priority, TABS.today, TABS.upcoming];
    }, [activeTab, isSecondaryTabActive]);
    const mobileTabBarRef = useRef<HTMLElement | null>(null);
    const mobileTabButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
    const [mobileIndicator, setMobileIndicator] = useState({ x: 0, width: 0, y: 0, height: 0 });

    const updateMobileIndicator = useCallback(() => {
        const barEl = mobileTabBarRef.current;
        const activeEl = mobileTabButtonRefs.current[activeTab];
        if (!barEl || !activeEl) return;

        setMobileIndicator({
            x: activeEl.offsetLeft,
            width: activeEl.offsetWidth,
            y: activeEl.offsetTop,
            height: activeEl.offsetHeight
        });
    }, [activeTab]);

    useEffect(() => {
        updateMobileIndicator();
        const onResize = () => updateMobileIndicator();
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, [updateMobileIndicator]);

    useEffect(() => {
        if (isDesktop || leftOpen || rightOpen) {
            return;
        }

        const frameId = window.requestAnimationFrame(updateMobileIndicator);
        return () => window.cancelAnimationFrame(frameId);
    }, [isDesktop, leftOpen, rightOpen, mobileTabs, updateMobileIndicator]);

    useEffect(() => {
        const maybeCloseLeftPanel = () => {
            const width = window.innerWidth;
            if (leftOpen && rightOpen && width > 900 && width < 1200) {
                setLeftOpen(false);
            }
        };

        maybeCloseLeftPanel();
        window.addEventListener('resize', maybeCloseLeftPanel);
        return () => window.removeEventListener('resize', maybeCloseLeftPanel);
    }, [leftOpen, rightOpen]);

    function clearFilters() {
        setModeFilter(ALL_MODES);
        setFilterCategory(ALL_CATEGORIES);
        setHideCompleted(false);
    }


    const toggleLeft = () => {
        setLeftOpen(v => {
            const next = !v;
            if (!isDesktop && next) setRightOpen(false);
            return next;
        });
    };

    const toggleRight = () => {
        setRightOpen(v => {
            const next = !v;
            if (!isDesktop && next) setLeftOpen(false);
            return next;
        });
    };

    const shouldAutoCloseLeftPanel = () => {
        const width = window.innerWidth;
        return width > 900 && width < 1200;
    };

    const toggleAddForm = () => {
        if (!editingItem) {
            if (leftOpen && isDesktop && shouldAutoCloseLeftPanel()) {
                setLeftOpen(false);
            }
            toggleRight();
        } else {
            setEditingItem(null);
        }
    }

    const handleCloseEditModal = () => {
        setEditingItem(null);
        setRightOpen(false);
    }

    const handleCloseAccountMenu = () => {
        setMenuOpen(false);
    }

    const pageTransitionKey = isLoading ? 'loading' : taskError ? 'error' :
        activeTab === TABS.journal ? TABS.journal : itemLength === 0 ? 'empty' : activeTab;

    return (<>
        <div className={`app_container ${leftOpen ? "left-open" : ""} ${rightOpen ? "right-open" : ""}`}>
            {(leftOpen || rightOpen || menuOpen) && (
                <div
                    className="panel_backdrop"
                    onClick={() => {
                        setLeftOpen(false);
                        setRightOpen(false);
                        setMenuOpen(false);
                    }}
                />
            )}
            <header className="app_header">
                {activeTab !== TABS.journal && (
                    <div className={`mobile-action-rail ${(leftOpen || rightOpen) && !isDesktop ? "mobile-action-rail--hidden" : ""}`}>
                        <IconButton
                            className="filter-toggle-button"
                            onClick={toggleLeft}
                            label="Filters"
                            icon={<ListFilter size={24} />}
                            showLabel={isDesktop}
                            isPriority={false}
                        />
                        {!isDesktop && (
                            <IconButton
                                className="show-completed-toggle-button"
                                onClick={() => setHideCompleted(prev => !prev)}
                                label={hideCompleted ? "Completed Tasks Hidden" : "Completed Tasks Shown"}
                                icon={hideCompleted ? <EyeOff size={24} /> : <Eye size={24} />}
                                isPriority={false}
                            />
                        )}
                        <IconButton
                            className="new-task-form-toggle-button"
                            onClick={toggleAddForm}
                            label="Add new task"
                            icon={<Plus size={24} strokeWidth={3} />}
                            isPriority={true}
                        />
                    </div>
                )}
                <div className="app_header_title">
                    <h1 className="app_h1">Daily Reset List</h1>
                    <p className="app_subtitle">
                        <span>
                            {dayOfWeekName}
                            {now.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                        </span>
                        <span className={`app_subtitle_last-updated ${isUpdatedDate ? "app_subtitle_last-updated--fresh" : ""}`}>
                            {isUpdatedDate ? "Updated just now" : lastUpdatedDate ? `Updated ${lastUpdatedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                            {isUpdatedDate ? <Check className="app_subtitle_last-updated_fresh_icon" size={12} strokeWidth={3} /> : null}
                        </span>
                    </p>
                </div>
                <AccountMenu
                    isDesktop={isDesktop}
                    isMenuOpen={menuOpen}
                    onMenuToggleOpen={() => setMenuOpen(prev => !prev)}
                    onMenuClose={handleCloseAccountMenu}
                />
            </header>
            <aside className="left_panel">
                <AppToolBar
                    activeTab={activeTab}
                    handleTabChange={handleTabChange}
                    modeFilter={modeFilter}
                    setModeFilter={setModeFilter}
                    hideCompleted={hideCompleted}
                    setHideCompleted={setHideCompleted}
                    filterCategory={filterCategory}
                    setFilterCategory={setFilterCategory}
                    setLeftOpen={setLeftOpen}
                    isDesktop={isDesktop}
                    categories={categories}
                />
            </aside>
            <main className="main_content">
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={pageTransitionKey}
                        className="main_content_page"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                    >
                        {isLoading ? (
                            <div className="app_loading-container">
                                <div aria-busy="true" className="app_loading-spinner"></div>
                                <p>Loading your tasks...</p>
                            </div>
                        ) : taskError ? (
                            <ErrorState
                                message={taskError}
                                onRetry={loadTasks}
                            />
                        ) : activeTab === TABS.journal ? (
                            <JournalProvider>
                                <Journal />
                            </JournalProvider>
                        ) : itemLength === 0 ? (
                            <div className="empty-state">
                                <h2>Welcome to Daily Reset List!</h2>
                                <div>
                                    <p>It looks like you don't have any tasks yet. Let's add your first one!</p>
                                    <button className="empty-state-create-button" onClick={toggleAddForm}>
                                        Get Started with your first task
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <TaskContextChecklist
                                onEditItem={handleEditItem}
                                onEditEvent={handleEditEvent}
                                sparkles={sparkles}
                                activeTab={activeTab}
                                modeFilter={modeFilter}
                                hideCompleted={hideCompleted}
                                filterCategory={filterCategory}
                                clearFilters={clearFilters}
                                enablePullToRefresh={true}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>
            <aside className="right_panel">
                {rightOpen && editingItem && editingItem.itemType === 'checklist-item' ? (
                    <EditTaskForm
                        categories={categories}
                        key={editingItem.id} // force remount when editing a different item
                        isSaving={isSaving}
                        formData={editingItem as ChecklistItem}
                        onSave={handleSave}
                        onClose={handleCloseEditModal}
                    />
                ) : rightOpen && editingItem && editingItem.itemType === 'google-event' ? (
                    <EditEventForm
                        key={editingItem.id} // force remount when editing a different item
                        isSaving={isSaving}
                        formData={editingItem as GoogleEvent}
                        onSave={handleEventSave}
                        onClose={handleCloseEditModal}
                    />
                ) : rightOpen ? (
                    <NewForm categories={categories} isDesktop={isDesktop} setRightOpen={setRightOpen} />
                ) : null}
            </aside>
            {!isDesktop && !leftOpen && !rightOpen && (
                <nav className="mobile-tab-bar" ref={mobileTabBarRef}>
                    <motion.span
                        className="mobile-tab-motion"
                        animate={{
                            x: mobileIndicator.x,
                            width: mobileIndicator.width
                        }}
                        transition={{ type: 'spring', stiffness: 580, damping: 44 }}
                    />
                    {mobileTabs.map(tab => (
                        <button
                            aria-label={tab}
                            key={tab}
                            ref={el => {
                                mobileTabButtonRefs.current[tab] = el;
                            }}
                            className={`mobile-tab-button ${activeTab === tab ? "mobile-tab-button--active" : ""}`}
                            onClick={() => handleTabChange(tab)}
                        >
                            <span className="mobile-tab-button-content">
                                {tab === TABS.journal
                                    ? <PencilIcon size={16} />
                                    : TAB_LABELS[tab]}
                            </span>
                        </button>
                    ))}
                </nav>
            )}
            <Footer />
        </div >
    </>)

}

export default LoggedIn;
