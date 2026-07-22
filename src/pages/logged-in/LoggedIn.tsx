
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
import { MOBILE_TAB_LABELS, TABS, type Tab } from 'src/app-toolbar/tabs/types';
import MobileTabContent from 'src/app-toolbar/tabs/MobileTabContent';
import { ALL_CATEGORIES } from 'src/category-select/category-constants';
import { ALL_MODES, MODES } from 'src/checklist/constants';
import type { Mode } from 'src/app/types';
import './logged-in.css';
import useIsDesktop from 'src/pages/use-is-desktop';
import { Check, Eye, EyeOff, ListFilter, Plus } from 'lucide-react';
import IconButton from 'src/components/icon-button/IconButton';
import { JournalProvider } from 'src/journal/journal-provider';
import Journal from 'src/journal/Journal';
import type { GoogleEvent } from 'src/google-authorization/types';
import EditEventForm from 'src/google-authorization/EditEventForm';
import Footer from 'src/footer/Footer';
import { useUserSettings } from 'src/user-settings/use-user-settings';
import Search from 'src/app-toolbar/Search';
import GettingStartedDialog from 'src/onboarding/GettingStartedDialog';
import { readPersistentSetting, writePersistentSetting } from 'src/utilities/persistent-storage';
import { useAuthentication } from 'src/authentication/use-authentication';
import { ROUTES } from 'src/router';
import { useLocation } from 'wouter';
import { addTask, isChoreAccessChangedError } from 'src/app/api';
import { useDemoTask } from 'src/pages/demo/use-demo-task';
import { hasModifiedDemoTasks } from 'src/pages/demo/demo-tasks';

// preload pages
import('src/pages/user-settings/UserSettings');
import('src/pages/bulk-edit/BulkEdit');
import('src/pages/not-found/NotFound');
import('src/pages/PrivacyPolicy');
import { AnimatePresence, motion } from 'framer-motion';
import TaskContextChecklist from './TaskContextChecklist';
import { canManageTaskMembers } from 'src/sharing/chore-access';
import { useShareTasks } from 'src/sharing/use-share-tasks';

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const ONBOARDING_CHOICE_KEY = 'daily-reset-list-onboarding-choice-v1';
const FILTER_STORAGE_KEY = 'daily-reset-list-filters-v1';

type StoredFilters = {
    activeTab: Tab;
    modeFilter: Mode | typeof ALL_MODES;
    hideCompleted: boolean;
    filterCategory: string;
    sharedByMe: boolean;
    sharedByOthers: boolean;
    leftOpen: boolean;
};

const readStoredFilters = (storageKey: string): Partial<StoredFilters> => {
    if (typeof window === 'undefined') return {};

    try {
        const storedValue = window.localStorage.getItem(storageKey);
        if (!storedValue) return {};

        const parsed: unknown = JSON.parse(storedValue);
        if (!parsed || typeof parsed !== 'object') return {};

        const values = parsed as Record<string, unknown>;
        const filters: Partial<StoredFilters> = {};
        const validTabs = Object.values(TABS) as Tab[];
        const validModes: Array<Mode | typeof ALL_MODES> = [ALL_MODES, ...MODES];

        if (validTabs.includes(values.activeTab as Tab)) {
            filters.activeTab = values.activeTab as Tab;
        }
        if (validModes.includes(values.modeFilter as Mode | typeof ALL_MODES)) {
            filters.modeFilter = values.modeFilter as Mode | typeof ALL_MODES;
        }
        if (typeof values.hideCompleted === 'boolean') {
            filters.hideCompleted = values.hideCompleted;
        }
        if (typeof values.filterCategory === 'string') {
            filters.filterCategory = values.filterCategory;
        }
        if (typeof values.sharedByMe === 'boolean') {
            filters.sharedByMe = values.sharedByMe;
        }
        if (typeof values.sharedByOthers === 'boolean') {
            filters.sharedByOthers = values.sharedByOthers;
        }
        if (typeof values.leftOpen === 'boolean') {
            filters.leftOpen = values.leftOpen;
        }

        return filters;
    } catch {
        return {};
    }
};

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
        isUpdatedDate,
    } = useTask();
    const { isAuthenticated, email } = useAuthentication();
    const { categories, googleCalendarEnabled } = useUserSettings();
    const { loadCalendarEvents, updateEvent } = useGoogleCalendar();
    const { items: demoItems, isLoading: isLoadingDemoTasks } = useDemoTask();
    const [, setLocation] = useLocation();
    const isDesktop = useIsDesktop();
    const filterStorageKey = `${FILTER_STORAGE_KEY}:${email ?? 'current-user'}`;
    const [storedFilters] = useState(() => readStoredFilters(filterStorageKey));
    const [editingItem, setEditingItem] = useState<ChecklistItem | GoogleEvent | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>(storedFilters.activeTab ?? TABS.today);
    const [hideCompleted, setHideCompleted] = useState(storedFilters.hideCompleted ?? false);
    const [modeFilter, setModeFilter] = useState<Mode | typeof ALL_MODES>(storedFilters.modeFilter ?? ALL_MODES);
    const [filterCategory, setFilterCategory] = useState<string>(storedFilters.filterCategory ?? ALL_CATEGORIES);
    const [sharedByMe, setSharedByMe] = useState(storedFilters.sharedByMe ?? false);
    const [sharedByOthers, setSharedByOthers] = useState(storedFilters.sharedByOthers ?? false);
    const [leftOpen, setLeftOpen] = useState(storedFilters.leftOpen ?? isDesktop);
    const [rightOpen, setRightOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showGettingStarted, setShowGettingStarted] = useState(false);
    const [isCopyingDemoTasks, setIsCopyingDemoTasks] = useState(false);
    const lastUpdatedRaw = loadDate && 'current' in loadDate ? loadDate.current : null;
    const lastUpdatedDate = lastUpdatedRaw ? new Date(lastUpdatedRaw) : null;
    const onboardingStorageKey = `${ONBOARDING_CHOICE_KEY}:${email ?? 'current-user'}`;
    const { sharedUsers } = useShareTasks({ enabled: isAuthenticated });
    const hasSharedUsers = sharedUsers.some(user => user.status === 'accepted');

    useEffect(() => {
        const filters: StoredFilters = {
            activeTab,
            modeFilter,
            hideCompleted,
            filterCategory,
            sharedByMe,
            sharedByOthers,
            leftOpen,
        };

        try {
            window.localStorage.setItem(filterStorageKey, JSON.stringify(filters));
        } catch {
            // The UI remains usable when storage is unavailable or full.
        }
    }, [
        activeTab,
        filterCategory,
        filterStorageKey,
        hideCompleted,
        leftOpen,
        modeFilter,
        sharedByMe,
        sharedByOthers,
    ]);

    useEffect(() => {
        if (isAuthenticated && !isLoading && !taskError && itemLength === 0 && !readPersistentSetting(onboardingStorageKey)) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setShowGettingStarted(true);
        }
    }, [isAuthenticated, isLoading, itemLength, onboardingStorageKey, taskError]);

    function completeGettingStarted() {
        writePersistentSetting(onboardingStorageKey, 'complete');
        setShowGettingStarted(false);
    }

    function startFromScratch() {
        completeGettingStarted();
        setEditingItem(null);
        setLeftOpen(false);
        setRightOpen(true);
    }

    function chooseTemplate() {
        completeGettingStarted();
        setLocation(ROUTES.templates);
    }

    function startWithDemoTasks() {
        completeGettingStarted();
        setLocation(ROUTES.demo);
    }

    async function copyDemoTasksToAccount() {
        if (isCopyingDemoTasks) return;

        setIsCopyingDemoTasks(true);
        try {
            const accountIdByDemoId = new Map<string, string>();
            const orderedDemoItems = [...demoItems].sort((a, b) =>
                Number(a.parentUuid !== null) - Number(b.parentUuid !== null) || a.sortOrder - b.sortOrder,
            );

            for (const demoItem of orderedDemoItems) {
                const category = categories.find(candidate =>
                    candidate.isBuiltIn && (candidate.builtInKey === demoItem.category || candidate.id === demoItem.category),
                )?.id ?? demoItem.category;
                const response = await addTask({
                    ...demoItem,
                    id: crypto.randomUUID(),
                    category,
                    parentUuid: demoItem.parentUuid
                        ? accountIdByDemoId.get(demoItem.parentUuid) ?? null
                        : null,
                });

                if ('error' in response) {
                    throw new Error(response.error);
                }

                accountIdByDemoId.set(demoItem.id, response.id);
            }

            completeGettingStarted();
            loadTasks();
            showToast('Your demo tasks were added to your account.', 'success');
        } catch (error) {
            console.error('Failed to copy demo tasks:', error);
            showToast('Could not copy your demo tasks. Please try again.', 'error');
        } finally {
            setIsCopyingDemoTasks(false);
        }
    }
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
            showToast('Task updated successfully', 'success');
        } catch (error) {
            if (isChoreAccessChangedError(error)) {
                setEditingItem(null);
                setRightOpen(false);
            } else if (error instanceof Error && error?.message) {
                showToast(`Failed to update task: ${error.message}`, 'error');
            } else {
                showToast('Failed to update task. Please try again.', 'error');
            }
            throw error;
        } finally {
            setIsSaving(false);
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
            x: activeEl.offsetLeft + 6,
            width: Math.max(0, activeEl.offsetWidth - 12),
            y: activeEl.offsetTop,
            height: activeEl.offsetHeight
        });
    }, [activeTab]);

    useEffect(() => {
        if (!isAuthenticated) return;

        const handleVisibility = () => {
            if (document.visibilityState !== 'visible') {
                return;
            }

            const staleAfter = 5 * 60 * 1000;
            const lastLoad = loadDate && 'current' in loadDate ? loadDate.current : null;
            const isStale = !lastLoad || Date.now() - lastLoad.getTime() > staleAfter;

            if (!isStale) {
                return;
            }

            loadTasks();
            if (googleCalendarEnabled) {
                loadCalendarEvents();
            }
        };

        document.addEventListener('visibilitychange', handleVisibility);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibility);
        };
    }, [isAuthenticated, googleCalendarEnabled, loadDate, loadTasks, loadCalendarEvents]);


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
        setSharedByMe(false);
        setSharedByOthers(false);
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
        <GettingStartedDialog
            isOpen={showGettingStarted}
            onStartFromScratch={startFromScratch}
            onChooseTemplate={chooseTemplate}
            onStartWithDemoTasks={startWithDemoTasks}
            onCopyDemoTasks={
                !isLoadingDemoTasks && hasModifiedDemoTasks(demoItems)
                    ? copyDemoTasksToAccount
                    : undefined
            }
            isCopyingDemoTasks={isCopyingDemoTasks}
        />
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
                <div className="mobile-action-rail">
                    <IconButton
                        className="filter-toggle-button"
                        onClick={toggleLeft}
                        label="Filters"
                        icon={<ListFilter size={24} />}
                        showLabel={true}
                        isPriority={false}
                    />
                    {!isDesktop && (
                        <IconButton
                            className="show-completed-toggle-button"
                            onClick={() => setHideCompleted(prev => !prev)}
                            label={hideCompleted ? "Show completed" : "Hide completed"}
                            ariaLabel={hideCompleted ? "Show completed tasks" : "Hide completed tasks"}
                            icon={hideCompleted ? <EyeOff size={24} /> : <Eye size={24} />}
                            showLabel={true}
                            isPriority={false}
                        />
                    )}
                </div>
                <IconButton
                    className="new-task-form-toggle-button"
                    onClick={toggleAddForm}
                    label="Add new task"
                    icon={<Plus size={24} strokeWidth={3} />}
                    isPriority={true}
                    showLabel={false}
                />
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
                    hasSharedUsers={hasSharedUsers || sharedByMe || sharedByOthers}
                    sharedByMe={sharedByMe}
                    setSharedByMe={setSharedByMe}
                    sharedByOthers={sharedByOthers}
                    setSharedByOthers={setSharedByOthers}
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
                        ) : activeTab === TABS.search ? (
                            <Search onEditItem={handleEditItem} sparkles={sparkles} />
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
                                sharedByMe={sharedByMe}
                                sharedByOthers={sharedByOthers}
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
                        enableSharing
                        canManageSharing={canManageTaskMembers(
                            (editingItem as ChecklistItem).accessRole
                        )}
                        formData={editingItem as ChecklistItem}
                        onSave={handleSave}
                        onClose={handleCloseEditModal}
                        onMembersChanged={loadTasks}
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
                            aria-label={MOBILE_TAB_LABELS[tab]}
                            key={tab}
                            ref={el => {
                                mobileTabButtonRefs.current[tab] = el;
                            }}
                            className={`mobile-tab-button ${activeTab === tab ? "mobile-tab-button--active" : ""}`}
                            onClick={() => handleTabChange(tab)}
                        >
                            <span className="mobile-tab-button-content">
                                <MobileTabContent tab={tab} />
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
