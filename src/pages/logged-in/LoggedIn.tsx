
import React, { useState, type SetStateAction } from 'react';
import { ItemModal } from 'item-modal/ItemModal';
import type { ChecklistItem } from 'app/types';
import Checklist from 'checklist/Checklist';
import Toast from 'src/toast/Toast';
import ErrorState from 'src/error-state/ErrorState';
import { useTask } from 'src/app/use-task';
import { useToast } from 'src/toast/use-toast';
import SparklesOverlay from 'src/app/SparklesOverlay';
import { useTheme } from 'src/themes/use-theme';
import AccountMenu from 'app/AccountMenu';
import NewTaskForm from 'src/new-task-form/NewTaskForm';
import AppToolBar from 'src/app-toolbar/AppToolbar';
import { TABS, type Tab } from 'src/app-toolbar/tabs/types';
import { ALL_CATEGORIES } from 'src/category-select/category-constants';
import { ALL_MODES } from 'src/checklist/constants';
import type { Mode } from 'src/app/types';
import './logged-in.css';
import useIsDesktop from '../use-is-desktop';
import { Filter, PlusCircle } from 'lucide-react';

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const LoggedIn: React.FC = () => {
    useTheme();
    const now = new Date();
    const dayOfWeekName = daysOfWeek[now.getDay()] + ", ";
    const { toasts, showToast, removeToast } = useToast();
    const {
        isLoading,
        error,
        loadTasks,
        updateItem,
        loadDate,
    } = useTask();
    const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);
    const [activeTab, setActiveTab] = useState(TABS.today);
    const [showFilters, setShowFilters] = useState(false);
    const [hideCompleted, setHideCompleted] = useState(true);
    const [modeFilter, setModeFilter] = useState<Mode | typeof ALL_MODES>(ALL_MODES);
    const [filterCategory, setFilterCategory] = useState<string>(ALL_CATEGORIES);
    const isDesktop = useIsDesktop();
    const [leftOpen, setLeftOpen] = useState(isDesktop ? true : false);
    const [rightOpen, setRightOpen] = useState(false);

    async function handleSave(saveItem: ChecklistItem) {
        if (!editingItem) return;

        try {
            await updateItem(saveItem);
            setEditingItem(null);
            showToast('Task updated successfully', 'success');
        } catch {
            showToast('Failed to update task. Please try again.', 'error');
        }
    }

    const sparkles = <SparklesOverlay />;

    function handleEditItem(item: ChecklistItem) {
        setEditingItem(item);
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


    return (<>
        {editingItem ? (
            <ItemModal
                formData={editingItem}
                setEditingItem={setEditingItem}
                onSave={handleSave}
                onClose={() => setEditingItem(null)}
            />
        ) : null}
        {toasts.map(toast => (
            <Toast
                key={toast.id}
                message={toast.message}
                type={toast.type}
                onClose={() => removeToast(toast.id)}
            />
        ))}
        <div className={`app_container ${leftOpen ? "left-open" : ""} ${rightOpen ? "right-open" : ""}`}>
            <header className="app_header">
                <button
                    className="new-task-form-toggle-button"
                    onClick={toggleLeft}
                    aria-label="Toggle filters"
                >
                    <Filter size={24} />
                    Filters
                </button>
                <h1 className="app_h1">For My Today</h1>
                <p className="app_subtitle">
                    {dayOfWeekName}
                    {now.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                    <br />
                    {loadDate ? ` (Last updated: ${loadDate.toLocaleTimeString()})` : ''}
                </p>
                <button
                    className="new-task-form-toggle-button"
                    onClick={toggleRight}
                    aria-label="Add new task"
                >
                    <PlusCircle size={24} />
                    Create
                </button>
                <AccountMenu />
            </header>
            <aside className="left_panel">
                <AppToolBar
                    showFilters={showFilters}
                    setShowFilters={setShowFilters}
                    activeTab={activeTab}
                    handleTabChange={handleTabChange}
                    modeFilter={modeFilter}
                    setModeFilter={setModeFilter}
                    hideCompleted={hideCompleted}
                    setHideCompleted={setHideCompleted}
                    filterCategory={filterCategory}
                    setFilterCategory={setFilterCategory}
                />
            </aside>
            <main className="main_content">
                {isLoading ? (
                    <div className="app_loading-container">
                        <div aria-busy="true" className="app_loading-spinner"></div>
                        <p>Loading your tasks...</p>
                    </div>
                ) : error ? (
                    <ErrorState
                        message={error}
                        onRetry={loadTasks}
                    />
                ) : (
                    <Checklist
                        onEditItem={handleEditItem}
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
                <NewTaskForm />
            </aside>
        </div >
    </>)

}

export default LoggedIn;
