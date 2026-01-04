import { useState, useEffect, useMemo, type FC } from 'react';
import { FolderArchive } from 'lucide-react';
import 'app/app.css';
import { ItemModal } from 'item-modal/ItemModal.tsx';
import type { ChecklistItem } from 'app/types';
import Checklist from 'checklist/Checklist.tsx';
import { fetchTasks, updateTask } from 'app/api';
import { isDateToday } from 'src/utilities/is-date-today';
import GoogleLoginButton from 'src/authentication/google-login-button';
import GoogleLogoutButton from 'src/authentication/google-logout-button';
import { loginWithGoogle } from 'src/authentication/authentication-api';
import { AUTH_TOKEN_KEY } from 'src/authentication/constants';

const App: FC = () => {
    const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);
    const [isActiveList, setActiveChecklist] = useState(true);
    const [items, setItems] = useState<ChecklistItem[]>([]);
    const [activeFilter, setActiveFilter] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(() =>
        Boolean(localStorage.getItem(AUTH_TOKEN_KEY))
    );
    const filteredList = useMemo(() => {
        return isActiveList
            ? items.filter(item => !item.isArchived)
            : items.filter(item => item.isArchived);
    }, [items, isActiveList]);

    useEffect(() => {
        if (!isAuthenticated) return;
        let cancelled = false;
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
                setItems([]);
            }
        });
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
        updateTask(editingItem).then((data) => {
            console.log(data);
        }).catch((error) => {
            alert('Task was not updated');
            setItems(prevItems);
            console.error('Task update failed', error);
        });
        setEditingItem(null);
    }

    function toggleChecklist() {
        const next = !isActiveList;
        setActiveChecklist(next);
        setActiveFilter('');
        setEditingItem(null);
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
            <div className="app_container">
                <header className="app_header">
                    <h1 className="app_h1">My To Do List</h1>
                    <div className="app_header_button-group">
                        {isAuthenticated ? (
                            <GoogleLogoutButton />
                        ) : (
                            <GoogleLoginButton
                                clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
                                onSuccess={async (token) => {
                                    try {
                                        await loginWithGoogle(token);
                                        setIsAuthenticated(true);
                                    } catch (err) {
                                        console.error(err);
                                    }
                                }}
                                onError={(err) => {
                                    console.error("Google login error:", err);
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
                    <Checklist
                        items={filteredList}
                        isActiveList={isActiveList}
                        setItems={setItems}
                        setEditingItem={setEditingItem}
                        activeFilter={activeFilter}
                        setActiveFilter={setActiveFilter}
                    />
                </main>
            </div>
        </>
    );
};

export default App;
