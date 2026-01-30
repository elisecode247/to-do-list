import { useState, useEffect, useMemo, type FC } from 'react';
import { FolderArchive } from 'lucide-react';
import './app.css';
import { ItemModal } from 'item-modal/ItemModal.tsx';
import type { ChecklistItem } from 'app/types';
import Checklist from 'checklist/Checklist.tsx';
import GoogleLoginButton from 'src/authentication/google-login-button';
import GoogleLogoutButton from 'src/authentication/google-logout-button';
import Toast from 'src/toast/Toast.tsx';
import ErrorState from 'src/error-state/ErrorState';
import { type Tag } from 'src/checklist/constants';
import type { UniqueIdentifier } from '@dnd-kit/core';
import { useAuthentication } from 'src/authentication/use-authentication';
import { useTask } from 'src/app/use-task';
import { useToast } from 'src/toast/use-toast';

const App: FC = () => {
    const { toasts, showToast, removeToast } = useToast();
    const { isAuthenticated, login, logout } = useAuthentication();
    const {
        items,
        isLoading,
        error,
        loadTasks,
        addItem,
        deleteItem,
        updateItem,
        toggleItem,
        prioritizeItem,
        archiveItem,
        hideItem,
        reorderItems,
        reset
    } = useTask({ enabled: isAuthenticated });
    const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);
    const [isActiveList, setActiveChecklist] = useState(true);
    const [activeFilters, setActiveFilters] = useState<Tag[]>([]);

    const filteredList = useMemo(() => {
        return isActiveList
            ? items.filter(item => !item.isArchived)
            : items.filter(item => item.isArchived);
    }, [items, isActiveList]);

    useEffect(() => {
        if (!isAuthenticated) return;

        let cancelled = false;

        const fetchData = () => loadTasks(cancelled);
        fetchData();

        return () => {
            cancelled = true;
        };
    }, [isAuthenticated])

    async function handleSave() {
        if (!editingItem) return;

        try {
            await updateItem(editingItem);
            setEditingItem(null);
            showToast('Task updated successfully', 'success');
        } catch {
            showToast('Failed to update task. Please try again.', 'error');
        }
    }

    function toggleChecklist() {
        const next = !isActiveList;
        setActiveChecklist(next);
        setActiveFilters([]);
        setEditingItem(null);
    }

    function handleLogout() {
        logout();
        setActiveFilters([]);
        setActiveChecklist(true);
        reset();
    }

    function handlePrioritizeItem(id: UniqueIdentifier): void {
        prioritizeItem(id);
    }


    function handleEditItem(item: ChecklistItem) {
        setEditingItem(item);
    }

    async function handleToggleItem(id: UniqueIdentifier, checked: boolean) {
        try {
            await toggleItem(id, checked)
        } catch(err) {
            console.error('Failed to toggle task:', err);
            showToast('Failed to update task status. Please try again.', 'error');
        };
    }


    async function handleArchiveItem(id: UniqueIdentifier) {
        try {
            await archiveItem(id);
        } catch(err) {
            console.error('Failed to archive task:', err);
            showToast('Failed to update task archive status. Please try again.', 'error');
        }
    }


    function handleChangeFilters(filters: Tag[]) {
        setActiveFilters(filters);
    }

    async function handleDeleteItem(id: UniqueIdentifier) {
        try {
            await deleteItem(id);
        } catch(e) {
            showToast('Task could not be deleted. Please try again.', 'error');
        }
    }

    async function handleAddItem(newItem: ChecklistItem) {
        try {
            await addItem(newItem)
        } catch(e) {
            showToast('Failed to add task. Please try again.', 'error');
        }
    }

    type ReorderArgs = { activeId: UniqueIdentifier; overId: UniqueIdentifier; };
    function handleReorderItems({ activeId, overId }: ReorderArgs) {
        reorderItems(activeId, overId);
    }

    function handleHideItem(id: UniqueIdentifier) {
        hideItem(id);
    }

    return (
        <>
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
            <div className="app_container">
                <header className="app_header">
                    <h1 className="app_h1">My To Do List</h1>
                    <div className="app_header_button-group">
                        {isAuthenticated ? (
                            <GoogleLogoutButton onLogout={handleLogout} />
                        ) : (
                            <GoogleLoginButton
                                onSuccess={async (token) => {
                                    try {
                                        await login(token);
                                    } catch (err) {
                                        console.error(err);
                                    }
                                }}
                            />
                        )}
                        {isAuthenticated && isActiveList && (
                            <button
                                id="see-archived-data"
                                className="app_see-archived-checklist-button"
                                disabled={!!editingItem}
                                onClick={toggleChecklist}
                                title="See Archived Items"
                            >
                                <FolderArchive size={12} />
                                <span className="app_see-archived-checklist-text">
                                    &nbsp; See Archived Checklist
                                </span>
                            </button>
                        )}
                        {isAuthenticated && !isActiveList && (
                            <button
                                id="see-active-checklist"
                                className="app_see-active-checklist-button"
                                onClick={toggleChecklist}
                                title="See Active Checklist"
                                disabled={!!editingItem}
                            >
                                <FolderArchive size={12} />
                                <span className="app_see-archived-checklist-text">
                                    &nbsp; See Active Checklist
                                </span>
                            </button>
                        )}
                    </div>
                </header>
                <main className="app_main">
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
                            items={filteredList}
                            isActiveList={isActiveList}
                            activeFilters={activeFilters}
                            onDeleteItem={handleDeleteItem}
                            onPrioritizeItem={handlePrioritizeItem}
                            onHideItem={handleHideItem}
                            onAddItem={handleAddItem}
                            onEditItem={handleEditItem}
                            onToggleItem={handleToggleItem}
                            onArchiveItem={handleArchiveItem}
                            onChangeFilters={handleChangeFilters}
                            onReorderItems={handleReorderItems}
                        />
                    )}
                </main>
            </div>
        </>
    );
};

export default App;
