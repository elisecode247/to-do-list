import { useState, type FC } from 'react';
import './app.css';
import './settings.css';
import { ItemModal } from 'item-modal/ItemModal.tsx';
import type { ChecklistItem } from 'app/types';
import Checklist from 'checklist/Checklist.tsx';
import Toast from 'src/toast/Toast.tsx';
import ErrorState from 'src/error-state/ErrorState';
import { type Tag } from 'src/checklist/constants';
import { useAuthentication } from 'src/authentication/use-authentication';
import { useTask } from 'src/app/use-task';
import { useToast } from 'src/toast/use-toast';
import ArchiveButton from './ArchiveButton';
import AccountMenu from './AccountMenu';
import LoggedOut from 'src/logged-out/LoggedOut';
import SparklesOverlay from './SparklesOverlay';
import DemoPage from 'src/demo/DemoPage';
import NotFound from 'src/not-found/NotFound';
import { Route, Switch } from "wouter";
import { ROUTES } from 'src/router';

const App: FC = () => {
    const { toasts, showToast, removeToast } = useToast();
    const { isAuthenticated, login } = useAuthentication();
    const {
        isLoading,
        error,
        loadTasks,
        updateItem,
    } = useTask();
    const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);
    const [isActiveList, setActiveChecklist] = useState(true);
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

    function toggleChecklist() {
        const next = !isActiveList;
        setActiveChecklist(next);
        setActiveFilters([]);
        setEditingItem(null);
    }

    function handleEditItem(item: ChecklistItem) {
        setEditingItem(item);
    }

    function handleChangeFilters(filters: Tag[]) {
        setActiveFilters(filters);
    }

    const handleLoginSuccess = async (token: string) => {
        try {
            await login(token);
        }
        catch (err) {
            console.error(err);
        }
    };

    function handleLogout() {
        setActiveFilters([]);
        setActiveChecklist(true);
    }

    return (

        <Switch>
            <Route path={ROUTES.home}>
                {!isAuthenticated ? (
                    <LoggedOut onSuccessfulLogin={handleLoginSuccess} />
                ) : (<>
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
                            <AccountMenu onLogout={handleLogout} />
                            <ArchiveButton
                                isActiveList={isActiveList}
                                editingItem={editingItem}
                                onToggle={toggleChecklist}
                            />
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
                </>)}
            </Route>
            <Route path={ROUTES.demo} component={DemoPage} />
            <Route>
                <NotFound />
            </Route>
        </Switch>
    );
};

export default App;
