import { useState, type FC, type Dispatch, type SetStateAction } from 'react';
import type { UniqueIdentifier } from '@dnd-kit/core';
import { Download, Upload, FolderArchive } from 'lucide-react';
import './app.css';
import { usePersistedChecklist } from './use-persisted-checklist.tsx';
import { ITEMS_KEY, ARCHIVED_KEY } from './constants.ts';
import { ItemModal } from '../item-modal/ItemModal.tsx';
import type { ChecklistItem } from './types.ts';
import Checklist from '../checklist/Checklist.tsx';

const App: FC = () => {
    const [activeChecklist, setActiveChecklist] = useState(true);
    const [items, setItems] = usePersistedChecklist(ITEMS_KEY);
    const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);
    const [archivedItems, setArchivedItems] = usePersistedChecklist(ARCHIVED_KEY);
    const updateItemById = (
        setList: Dispatch<SetStateAction<ChecklistItem[]>>,
        id: UniqueIdentifier,
        updater: (item: ChecklistItem) => ChecklistItem
    ) => setList(prev => prev.map(item => (item.id === id ? updater(item) : item)));

    const copyData = async () => {
        const storedItems = localStorage.getItem(ITEMS_KEY);
        if (!storedItems) {
            alert('No data to copy');
            return;
        }
        try {
            await navigator.clipboard.writeText(storedItems);
            alert('Data successfully copied to clipboard');
        } catch (err) {
            alert('Could not copy text: ' + err);
        }
    }

    const uploadData = () => {
        const data = prompt('Paste data here');
        try {
            if (!data) {
                alert('No data was pasted');
                return;
            }
            const parsedData = JSON.parse(data.trim());
            if (!Array.isArray(parsedData) ||
                !parsedData.every(
                    item =>
                        typeof item.id === 'string' &&
                        typeof item.text === 'string' &&
                        typeof item.done === 'boolean'
                )
            ) {
                alert('Invalid format');
                return;
            }
            setItems(parsedData);
        } catch (e) {
            alert('There was an error: ' + e);
        }
    }

    const handleSave = () => {
        if (!editingItem) return;
        updateItemById(setItems, editingItem.id, () => editingItem);
        setEditingItem(null);
    }

    function openArchivedList(isTrue: boolean) {
        setActiveChecklist(!isTrue);
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
                        {activeChecklist ? (
                            <button
                                id="see-archived-data"
                                className="archived-data-button"
                                onClick={() => openArchivedList(true)}
                                title="See Archived Items"
                            >
                                <FolderArchive size={12} />
                            </button>
                        ) : (
                            <button
                                id="see-active-checklist"
                                className="archived-data-button"
                                onClick={() => openArchivedList(false)}
                                title="See Active Checklist"
                            >
                                <FolderArchive size={12} />
                            </button>
                        )}
                        <button
                            id="download-data"
                            className="move-data"
                            onClick={copyData}
                            title="Copy Data"
                        >
                            <Download size={12} />
                        </button>
                        <button
                            id="upload-data"
                            className="move-data"
                            onClick={uploadData}
                            title="upload JSON data into list"
                        >
                            <Upload size={12} />
                        </button>
                    </div>
                </header>
                <main className="checklist">
                    {activeChecklist ? (
                        <Checklist
                            key="active-checklist"
                            isActiveList={true}
                            items={items}
                            setItems={setItems}
                            setTargetItems={setArchivedItems}
                            setEditingItem={setEditingItem}
                            updateItemById={updateItemById}
                        />
                    ) : (
                        <Checklist
                            key="archived-checklist"
                            isActiveList={false}
                            items={archivedItems}
                            setItems={setArchivedItems}
                            setTargetItems={setItems}
                            setEditingItem={setEditingItem}
                            updateItemById={updateItemById}
                        />
                    )}
                </main>
            </div>
        </>
    );
};

export default App;
