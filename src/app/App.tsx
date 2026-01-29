import { useState, useEffect, useMemo, type FC } from 'react';
import { FolderArchive } from 'lucide-react';
import './app.css';
import { ItemModal } from 'item-modal/ItemModal.tsx';
import type { ChecklistItem } from 'app/types';
import Checklist from 'checklist/Checklist.tsx';
import { fetchTasks, updateTask, updateTasksOrder, deleteTask, addTask } from 'app/api';
import { isDateToday } from 'src/utilities/is-date-today';
import GoogleLoginButton from 'src/authentication/google-login-button';
import GoogleLogoutButton from 'src/authentication/google-logout-button';
import Toast from 'src/toast/Toast.tsx';
import ErrorState from 'src/error-state/ErrorState';
import { type ToastMessage } from 'src/toast/types';
import { PRIORITY_TAG, type Tag } from 'src/checklist/constants';
import { arrayMove } from '@dnd-kit/sortable';
import type { UniqueIdentifier } from '@dnd-kit/core';
import { useAuthentication } from 'src/authentication/use-authentication';

const App: FC = () => {
    const { isAuthenticated, login, logout } = useAuthentication();
    const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);
    const [isActiveList, setActiveChecklist] = useState(true);
    const [items, setItems] = useState<ChecklistItem[]>([]);
    const [activeFilters, setActiveFilters] = useState<Tag[]>([]);
    const [isLoading, setIsLoading] = useState(isAuthenticated);
    const [error, setError] = useState<string | null>(null);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const showToast = (message: string, type: ToastMessage['type']) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
    };

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };
    const filteredList = useMemo(() => {
        return isActiveList
            ? items.filter(item => !item.isArchived)
            : items.filter(item => item.isArchived);
    }, [items, isActiveList]);

    function loadTasks(cancelled = false) {
        if (!cancelled) setError(null);
        setIsLoading(true);
        fetchTasks().then((data) => {
            if (cancelled) return;
            const formattedItems = data.map((item: ChecklistItem) => {
                return {
                    ...item,
                    done: isDateToday(item.lastCompleted)
                }
            })
            setItems(formattedItems);
        }).catch(error => {
            if (!cancelled) {
                console.error(error);
                setError('Failed to load your tasks. Please check your connection and try again.');
                setItems([]);
            }
        }).finally(() => {
            if (!cancelled) {
                setIsLoading(false);
            }
        });
    }
    useEffect(() => {
        if (!isAuthenticated) return;

        let cancelled = false;

        const fetchData = () => loadTasks(cancelled);
        fetchData();

        return () => {
            cancelled = true;
        };
    }, [isAuthenticated])

    const handleSave = () => {
        if (!editingItem) return;
        const prevItems = [...items];
        setItems(prev => {
            return prev.map(item => item.id === editingItem.id ? editingItem : item);
        });
        updateTask(editingItem)
            .then(() => {
                showToast('Task updated successfully', 'success');
                setEditingItem(null);
            })
            .catch((error) => {
                showToast('Failed to update task. Please try again.', 'error');
                setItems(prevItems);
                console.error('Task update failed', error);
            });
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
        setItems([]);
    }

    function handlePrioritizeItem(id: UniqueIdentifier): void {
        setItems(prev => {
            const updated = prev.map(item => {
                if (item.id !== id) return item;

                const hasPriority = item.tags.includes(PRIORITY_TAG);
                return {
                    ...item,
                    tags: hasPriority
                        ? item.tags.filter(t => t !== PRIORITY_TAG)
                        : [...item.tags, PRIORITY_TAG]
                };
            });

            const changedItem = updated.find(i => i.id === id);
            if (changedItem) {
                updateTask(changedItem).catch(err => {
                    console.error('Failed to prioritize task:', err);
                });
            }

            return updated;
        });
    }


    function handleEditItem(item: ChecklistItem) {
        setEditingItem(item);
    }

    function handleToggleItem(id: UniqueIdentifier, checked: boolean) {
        setItems(prev =>
            prev.map(item =>
                item.id === id
                    ? {
                        ...item,
                        done: checked,
                        lastCompleted: checked ? new Date().toISOString() : '',
                    }
                    : item
            )
        );
    }


    function handleArchiveItem(id: UniqueIdentifier) {
        setItems(prev =>
            prev.map(item =>
                item.id === id
                    ? { ...item, isArchived: !item.isArchived }
                    : item
            )
        );
    }


    function handleChangeFilters(filters: Tag[]) {
        setActiveFilters(filters);
    }

    function handleReorderItems({
        activeId,
        overId
    }: {
        activeId: number;
        overId: number;
    }) {
        setItems(prevItems => {
            const oldIndex = prevItems.findIndex(item => item.id === activeId);
            const newIndex = prevItems.findIndex(item => item.id === overId);

            if (oldIndex === -1 || newIndex === -1) return prevItems;

            const reordered = arrayMove(prevItems, oldIndex, newIndex);

            const updatedItems = reordered.map((item, index) => ({
                ...item,
                sortOrder: index
            }));

            // optimistic update
            updateTasksOrder(
                updatedItems.map(({ id, sortOrder }) => ({ id, sortOrder }))
            ).catch(err => {
                console.error('Failed to update task order:', err);
                // optional: reload tasks or rollback
            });

            return updatedItems;
        });
    }

    function deleteItem(id: UniqueIdentifier) {
        deleteTask(id).then(() => {
            setItems(prev => prev.filter(item => item.id !== id));
        }).catch((err) => {
            console.error('Failed to delete task:', err);
            alert('Task could not be deleted.');
        });
    }

    function handleAddItem(newItem: ChecklistItem) {
        addTask(newItem)
            .then((data) => {
                const formattedTask = {
                    id: data.id,
                    done: false,
                    text: data.text,
                    lastCompleted: data.lastCompleted,
                    note: data.note,
                    sortOrder: data.sortOrder,
                    category: data.category,
                    tags: data.tags,
                    isArchived: false
                } as ChecklistItem;
                setItems(prev => [formattedTask, ...prev]);
            })
            .catch((e) => {
                alert('Task could not be added');
                console.error(e);
            });
    }

    function handleHideItem(id: UniqueIdentifier) {
        let updatedItems = items.map(item =>
            item.id === id ? { ...item, isHidden: true } : item
        );
        setItems(updatedItems);
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
                        {isActiveList ? (
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
                        ) : (
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
                            onDeleteItem={deleteItem}
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
