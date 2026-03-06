
import React, { useState, useRef, useEffect, type SetStateAction } from 'react';
import EditTaskForm from 'src/edit-task-form/EditTaskForm';
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
import { TABS, TAB_LABELS, type Tab } from 'src/app-toolbar/tabs/types';
import { ALL_CATEGORIES } from 'src/category-select/category-constants';
import { ALL_MODES } from 'src/checklist/constants';
import type { Mode } from 'src/app/types';
import './logged-in.css';
import useIsDesktop from 'src/pages/use-is-desktop';
import { ListFilter, Plus } from 'lucide-react';
import NoteEditor from 'src/editor/NoteEditor';
import { type MDXEditorMethods } from '@mdxeditor/editor';
import { API_URL } from 'app/constants';
import { authHeaders } from 'src/authentication/authentication-api';
import { useDebounceValue } from 'usehooks-ts';
// preload pages
import('src/pages/user-settings/UserSettings');
import('src/pages/bulk-edit/BulkEdit');
import('src/pages/not-found/NotFound');

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const LoggedIn: React.FC = () => {
    useTheme();
    const now = new Date();
    const dayOfWeekName = daysOfWeek[now.getDay()] + ", ";
    const { toasts, showToast, removeToast } = useToast();
    const {
        isLoading,
        taskError,
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
    const [menuOpen, setMenuOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [initialNotes, setInitialNotes] = useState('');
    const [debouncedNotes, setDebouncedNotes] = useDebounceValue('', 1000);
    const [showNoteSaved, setShowNoteSaved] = useState(false);
    const noteRef = useRef<MDXEditorMethods>(null);
    const lastUpdatedRaw = loadDate && 'current' in loadDate ? loadDate.current : null;
    const lastUpdatedDate = lastUpdatedRaw ? new Date(lastUpdatedRaw) : null;

    const activeFilterCount =
        (hideCompleted ? 1 : 0) +
        (modeFilter === ALL_MODES ? 0 : 1) +
        (filterCategory === ALL_CATEGORIES ? 0 : 1);

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

    useEffect(() => {
        const fetchAppNotes = async () => {
            try {
                const response = await fetch(`${API_URL}/user-checklist`, {
                    method: "GET",
                    headers: await authHeaders()
                });

                if (!response.ok) {
                    const text = await response.text();
                    console.error(`Failed to fetch app notes: ${response.status} - ${text}`);
                    return;
                }

                return await response.json();
            } catch (err) {
                console.error("Failed to load app notes:", err);
            }
        };

        fetchAppNotes().then(data => {
            if (data && data.notes) {
                setInitialNotes(data.notes);
            }
        });

    }, [])

    useEffect(() => {
        const saveAppNotes = async (notes: string) => {
            try {
                const response = await fetch(`${API_URL}/user-checklist`, {
                    method: "PUT",
                    headers: await authHeaders(),
                    body: JSON.stringify({ notes }),
                });

                if (!response.ok) {
                    const text = await response.text();
                    console.error(`Failed to save app notes: ${response.status} - ${text}`);
                    showToast('Failed to save app notes.', 'error');
                    setShowNoteSaved(false);
                } else {
                    setShowNoteSaved(true);
                    console.info("App notes saved successfully");
                    setTimeout(() => setShowNoteSaved(false), 2000);
                }
            } catch (err) {
                console.error("Failed to save app notes:", err);
                showToast('Failed to save app notes.', 'error');
                setShowNoteSaved(false);
            }
        };

        if (debouncedNotes) {
            saveAppNotes(debouncedNotes);
        }
    }, [debouncedNotes, showToast]);

    function handleNotesChange(markdown: string) {
        setDebouncedNotes(markdown);
    }


    return (<>
        {toasts.map(toast => (
            <Toast
                key={toast.id}
                message={toast.message}
                type={toast.type}
                onClose={() => removeToast(toast.id)}
            />
        ))}
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
                <button
                    className={`filter-toggle-button
                        ${(leftOpen || rightOpen) && !isDesktop ? " hidden " : ""}`}
                    onClick={toggleLeft}
                    aria-label="Toggle filters"
                >
                    <ListFilter size={24} />
                    {isDesktop && <span>Filters</span>}
                    {activeFilterCount > 0 && (
                        <span className="applied-filter-count-badge">
                            {activeFilterCount}
                        </span>
                    )}
                </button>
                <div className="app_header_title">
                    <h1 className="app_h1">Daily Reset</h1>
                    <p className="app_subtitle">
                        <span>
                            {dayOfWeekName}
                            {now.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                        </span>
                        <span>
                            {lastUpdatedDate ? ` Last updated: ${lastUpdatedDate.toLocaleDateString()} ${lastUpdatedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                        </span>
                    </p>
                </div>
                <button
                    className={`new-task-form-toggle-button
                        ${(leftOpen || rightOpen) && !isDesktop ? " hidden " : ""}`}
                    onClick={toggleAddForm}
                    aria-label="Add new task"
                >
                    <Plus size={24} strokeWidth={3} />
                </button>
                <AccountMenu
                    isMenuOpen={menuOpen}
                    onMenuToggleOpen={() => setMenuOpen(prev => !prev)}
                    onMenuClose={handleCloseAccountMenu}
                />
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
                ) : taskError ? (
                    <ErrorState
                        message={taskError}
                        onRetry={loadTasks}
                    />
                ) : (
                    <>
                        <div style={{ position: 'relative' }}>
                            <NoteEditor
                                className="app_note-editor"
                                initialMarkdown={initialNotes || "Write notes here"}
                                readOnly={false}
                                ref={noteRef}
                                onChange={handleNotesChange}
                            />
                            {showNoteSaved && <div className="note-saved-indicator">Notes saved</div>}
                        </div>
                        <Checklist
                            onEditItem={handleEditItem}
                            sparkles={sparkles}
                            activeTab={activeTab}
                            modeFilter={modeFilter}
                            hideCompleted={hideCompleted}
                            filterCategory={filterCategory}
                            clearFilters={clearFilters}
                        />
                    </>
                )}
            </main>
            <aside className="right_panel">
                {editingItem ? (
                    <EditTaskForm
                        isSaving={isSaving}
                        formData={editingItem}
                        setEditingItem={setEditingItem}
                        onSave={handleSave}
                        onClose={handleCloseEditModal}
                    />
                ) : <NewTaskForm />}
            </aside>
            {!isDesktop && !leftOpen && !rightOpen && (
                <nav className="mobile-tab-bar">
                    {Object.values(TABS)
                        .filter(tab =>
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
                                {TAB_LABELS[tab]}
                            </button>
                        ))}
                </nav>
            )}
        </div >
    </>)

}

export default LoggedIn;
