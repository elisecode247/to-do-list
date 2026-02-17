
import React, { useState } from 'react';
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
    } = useTask();
    const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);

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
        <div className="app_container">
            <header className="app_header">
                <h1 className="app_h1">For My Today</h1>
                <p className="app_subtitle">
                    {dayOfWeekName}
                    {now.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                </p>
                <AccountMenu />
                <NewTaskForm />
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
                        onEditItem={handleEditItem}
                        sparkles={sparkles}
                    />
                )}
            </main>
        </div>
    </>)

}

export default LoggedIn;
