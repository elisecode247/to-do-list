import { useState, useMemo, useCallback, type FC } from 'react';
import { FolderArchive } from 'lucide-react';
import './app.css';
import { ItemModal } from 'item-modal/ItemModal.tsx';
import type { ChecklistItem } from 'app/types';
import Checklist from 'checklist/Checklist.tsx';
import { fetchTasks, updateTask } from 'app/api';
import { isDateToday } from 'src/utilities/is-date-today';
import GoogleLoginButton from 'src/authentication/google-login-button';
import Toast from 'src/toast/Toast.tsx';
import ErrorState from 'src/error-state/ErrorState';
import { type ToastMessage } from 'src/toast/types';
import { type Tag } from 'src/checklist/constants';
import SuccessGif from 'src/success-state/success-gif';

const App: FC = () => {
    const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);
    const [isActiveList, setActiveChecklist] = useState(true);
    const [items, setItems] = useState<ChecklistItem[]>([]);
    const [activeFilters, setActiveFilters] = useState<Tag[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const [showSuccessGif, setShowSuccessGif] = useState(false);

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
    const closeGif = useCallback(() => setShowSuccessGif(false), [setShowSuccessGif])

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

    function handleResetAppState() {
        setActiveFilters([]);
        setActiveChecklist(true);
        setItems([]);
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
            {showSuccessGif && (
                <SuccessGif onClose={closeGif} />
            )}
            <div className="app_container">
                <header className="app_header">
                    <h1 className="app_h1">My To Do List</h1>
                    <div className="app_header_button-group">
                        <GoogleLoginButton onReset={handleResetAppState} onLoad={loadTasks} />
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
                            onRetry={() => {
                                console.log("Retrying to load tasks...");
                                loadTasks()
                            }}
                        />
                    ) : (
                        <Checklist
                            items={filteredList}
                            isActiveList={isActiveList}
                            setItems={setItems}
                            setEditingItem={setEditingItem}
                            activeFilters={activeFilters}
                            setActiveFilters={setActiveFilters}
                            onSuccess={setShowSuccessGif}
                        />)}
                </main>
            </div>
        </>
    );
};

export default App;
