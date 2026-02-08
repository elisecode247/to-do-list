import { useState, type FC } from 'react';
import 'app/app.css';
import 'app/settings.css';
import { ItemModal } from 'item-modal/ItemModal.tsx';
import type { ChecklistItem } from 'app/types';
import Checklist from 'src/demo/DemoChecklist.tsx';
import Toast from 'src/toast/Toast.tsx';
import ErrorState from 'src/error-state/ErrorState';
import { type Tag } from 'src/checklist/constants';
import { useTask } from 'src/demo/use-demo-task';
import { useToast } from 'src/toast/use-toast';
import SparklesOverlay from 'src/app/SparklesOverlay';

const App: FC = () => {
    const { toasts, showToast, removeToast } = useToast();
    const {
        isLoading,
        error,
        loadTasks,
        updateItem
    } = useTask();
    const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);
    const [isActiveList, _setActiveChecklist] = useState(true);
    const [activeFilters, setActiveFilters] = useState<Tag[]>([]);

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

    const sparkles = <SparklesOverlay />;

    function handleEditItem(item: ChecklistItem) {
        setEditingItem(item);
    }

    function handleChangeFilters(filters: Tag[]) {
        setActiveFilters(filters);
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
                    <h1 className="app_h1">For My Today</h1>
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
                            isActiveList={isActiveList}
                            activeFilters={activeFilters}
                            onChangeFilters={handleChangeFilters}
                            onEditItem={handleEditItem}
                            sparkles={sparkles}
                        />
                    )}
                </main>
            </div>
        </>
    );
};

export default App;
