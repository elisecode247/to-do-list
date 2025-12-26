import { useState, useEffect, useEffectEvent, type FC } from 'react';
import { Download, Upload, FolderArchive } from 'lucide-react';
import 'app/app.css';
import { usePersistedChecklist } from 'app/use-persisted-checklist.tsx';
import { ITEMS_KEY, ARCHIVED_KEY } from 'app/constants.ts';
import { ItemModal } from 'item-modal/ItemModal.tsx';
import type { ChecklistItem } from 'app/types';
import Checklist from 'checklist/Checklist.tsx';
import { isChecklistItemArray } from 'app/utilities/is-valid-item-array.ts';
import { fetchChores, postChores, updateChore } from 'app/api';

const App: FC = () => {
    const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);
    const [isDailyChecklist, setActiveChecklist] = useState(true);
    const [items, setItems] = usePersistedChecklist(ITEMS_KEY);
    const [archivedItems, setArchivedItems] = usePersistedChecklist(ARCHIVED_KEY);
    const activeKey = isDailyChecklist ? ITEMS_KEY : ARCHIVED_KEY;
    const setActiveItems = isDailyChecklist ? setItems : setArchivedItems;
    const updateActiveItems = useEffectEvent(setActiveItems);
    const activeChecklist = isDailyChecklist ? {
        items,
        setActiveItems: setItems,
        setTargetItems: setArchivedItems,
        isActiveList: true,
    } : {
        items: archivedItems,
        setActiveItems: setArchivedItems,
        setTargetItems: setItems,
        isActiveList: false,
    };
    useEffect(() => {
        fetchChores().then((data) => {
            updateActiveItems(data);
        })
    }, [])

    const copyData = async () => {
        const storedItems = localStorage.getItem(activeKey);
        if (!storedItems) {
            alert('No data to copy');
            return;
        }
        try {
            await navigator.clipboard.writeText(storedItems);
            alert(activeKey + ' successfully copied to clipboard');
        } catch (err) {
            alert('Could not copy text: ' + err);
        }
    }

    const uploadData = () => {
        const data = prompt('Paste data here for ' + activeKey);
        try {
            if (!data) {
                alert('No data was pasted');
                return;
            }
            const parsedData = JSON.parse(data.trim());
            if (!isChecklistItemArray(parsedData)) {
                alert('Invalid format');
                return;
            }

            setActiveItems(parsedData);
            postChores(parsedData);
            alert('Chores saved!');
        } catch (e) {
            alert('There was an error: ' + e);
        }
    }

    const handleSave = () => {
        if (!editingItem) return;
        setActiveItems(prev => {
            return prev.map(item => item.id === editingItem.id ? editingItem : item);
        });
        updateChore(editingItem).then((data) => {
            alert('Chore updated');
            console.log(data);
        }).catch((e) => {
            alert('Chore was not updated:' + e);
            console.error(e);
        });
        setEditingItem(null);
    }

    function toggleChecklist() {
        setActiveChecklist(prev => !prev);
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
            <div className="container">
                <header>
                    <h1 >My To Do List</h1>
                    <div className="header-button-group">
                        {isDailyChecklist ? (
                            <button
                                id="see-archived-data"
                                className="archived-data-button"
                                disabled={!!editingItem}
                                onClick={toggleChecklist}
                                title="See Archived Items"
                            >
                                <FolderArchive size={12} />
                            </button>
                        ) : (
                            <button
                                id="see-active-checklist"
                                className="archived-data-button"
                                onClick={toggleChecklist}
                                title="See Active Checklist"
                                disabled={!!editingItem}
                            >
                                <FolderArchive size={12} />
                            </button>
                        )}
                        <button
                            id="download-data"
                            className="move-data"
                            disabled={!!editingItem}
                            onClick={copyData}
                            title="Copy Data"
                        >
                            <Download size={12} />
                        </button>
                        <button
                            id="upload-data"
                            className="move-data"
                            disabled={!!editingItem}
                            onClick={uploadData}
                            title="upload JSON data into list"
                        >
                            <Upload size={12} />
                        </button>
                    </div>
                </header>
                <main className="checklist">
                    <Checklist
                        {...activeChecklist}
                        setEditingItem={setEditingItem}
                    />
                </main>
            </div>
        </>
    );
};

export default App;
