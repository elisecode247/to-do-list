
import React, { useState, type SetStateAction } from 'react';
import { useGoogleCalendar } from 'src/google-authorization/use-google-calendar';
import EditTaskForm from 'src/edit-task-form/EditTaskForm';
import type { ChecklistItem } from 'app/types';
import Checklist from 'checklist/Checklist';
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
// preload pages
import('src/pages/user-settings/UserSettings');
import('src/pages/bulk-edit/BulkEdit');
import('src/pages/not-found/NotFound');
import('src/pages/PrivacyPolicy');

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

    const toggleAddForm = () => {
        if (!editingItem) {
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
                <IconButton
                    className={`filter-toggle-button
                        ${(leftOpen || rightOpen) && !isDesktop ? " hidden " : ""}`}
                    onClick={toggleLeft}
                    label="Filters"
                    icon={<ListFilter size={24} />}
                    showLabel={isDesktop}
                    isPriority={false}
                />
                {!isDesktop && (
                    <IconButton
                        className={`show-completed-toggle-button
                        ${(leftOpen || rightOpen) && !isDesktop ? " hidden " : ""}`}
                        onClick={() => setHideCompleted(prev => !prev)}
                        label={hideCompleted ? "Completed Tasks Hidden" : "Completed Tasks Shown"}
                        icon={hideCompleted ? <EyeOff size={24} /> : <Eye size={24} />}
                        isPriority={false}
                    />)}
                <div className="app_header_title">
                    <h1 className="app_h1">Daily Reset List</h1>
                    <p className="app_subtitle">
                        <span>
                            {dayOfWeekName}
                            {now.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                        </span>
                        <span className={`app_subtitle_last-updated ${isUpdatedDate ? "app_subtitle_last-updated--fresh" : ""}`}>
                            {lastUpdatedDate ? ` Last updated: ${lastUpdatedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                        </span>
                        {isUpdatedDate && <Check className="app_subtitle_last-updated_fresh" size={16} />}
                    </p>
                </div>
                <IconButton
                    className={`new-task-form-toggle-button
                        ${(leftOpen || rightOpen) && !isDesktop ? " hidden " : ""}`}
                    onClick={toggleAddForm}
                    label="Add new task"
                    icon={<Plus size={24} strokeWidth={3} />}
                    isPriority={true}
                />
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
                />
            </aside>
            <main className="main_content">
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
                    <Checklist
                        onEditItem={handleEditItem}
                        onEditEvent={handleEditEvent}
                        sparkles={sparkles}
                        activeTab={activeTab}
                        modeFilter={modeFilter}
                        hideCompleted={hideCompleted}
                        filterCategory={filterCategory}
                        clearFilters={clearFilters}
                    />
                )}
            </main>
            <aside className="right_panel">
                {rightOpen && editingItem && editingItem.itemType === 'checklist-item' ? (
                    <EditTaskForm
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
                    <NewForm isDesktop={isDesktop} setRightOpen={setRightOpen} />
                ) : null}
            </aside>
            {!isDesktop && !leftOpen && !rightOpen && (
                <nav className="mobile-tab-bar">
                    {Object.values(TABS)
                        .filter(tab =>
                            tab === TABS.journal ||
                            tab === TABS.priority ||
                            tab === TABS.today ||
                            tab === TABS.upcoming
                        )
                        .map(tab => (
                            <button
                                key={tab}
                                className={`mobile-tab-button ${activeTab === tab ? "mobile-tab-button--active" : ""}`}
                                onClick={() => handleTabChange(tab)}
                            >
                                {tab === TABS.journal ? <PencilIcon size={16} /> : TAB_LABELS[tab]}
                            </button>
                        ))}
                </nav>
            )}
            <Footer />
        </div >
    </>)

}

export default LoggedIn;
