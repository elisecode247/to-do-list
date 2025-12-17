import { useState, type FC } from 'react';
import { DndContext } from '@dnd-kit/core';
import type { DragEndEvent, UniqueIdentifier } from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext
} from '@dnd-kit/sortable';
import { SortableItem } from '../sortable-item/SortableItem.tsx';
import { ListChecks, Download, Upload } from 'lucide-react';
import './app.css';
import { usePersistedChecklist } from './use-persisted-checklist.tsx';
import { ITEMS_KEY } from './constants';
import { ItemModal } from '../item-modal/ItemModal.tsx';
import type { ChecklistItem } from './types.ts';
import { formatDate } from './utilities/format-date.ts'

const App: FC = () => {
    const [items, setItems] = usePersistedChecklist();
    const [inputText, setInputText] = useState<string>("");
    const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);

    const updateItemById = (
        id: UniqueIdentifier,
        updater: (item: ChecklistItem) => ChecklistItem
    ) => setItems(prev => prev.map(item => (item.id === id ? updater(item) : item)));

    const resetChecked = (): void => {
        setItems(prev => prev.map(item => ({ ...item, done: false })))
    };

    const addItem = (): void => {
        if (!inputText.trim()) return;
        const id: UniqueIdentifier = crypto.randomUUID();
        setItems(prev => [{ id, text: inputText, done: false, lastCompleted: '', note: '' }, ...prev]);
        setInputText("");
    };

    const updateItemText = (id: UniqueIdentifier, newText: string): void => {
        updateItemById(id, item => ({...item, text: newText }));
    };

    const deleteItem = (id: UniqueIdentifier): void => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        setItems((items) => {
            const oldIndex = items.findIndex((item) => item.id === active.id);
            const newIndex = items.findIndex((item) => item.id === over.id);

            return arrayMove(items, oldIndex, newIndex);
        });
    }

    const toggleChecked = (id: UniqueIdentifier) => {
        updateItemById(id, item => ({
            ...item,
            done: !item.done,
            lastCompleted: !item.done ? formatDate(new Date()) : item.lastCompleted,
        }));
    };

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
            ){
                alert('Invalid format');
                return;
            }
            setItems(parsedData);
        } catch (e) {
            alert('There was an error: ' + e);
        }
    }

    const handleEdit = (id: UniqueIdentifier) => {
        const selectedItem = items.find(item => item.id === id);
        if (!selectedItem) {
            alert('task not found');
            console.error('task id: ' + id);
            return;
        }

        setEditingItem({ ...selectedItem });
    };

    const handleSave = () => {
        if (!editingItem) return;
        updateItemById(editingItem.id, () => editingItem);
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
            <header>
                <h1 >My To Do List</h1>
            </header>
            <main className="checklist">
                <div>
                    <button onClick={resetChecked}>
                        <ListChecks size={12} />
                    </button>
                    <input
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => {
                            e.stopPropagation();
                            if (e.key === 'Enter') {
                                addItem();
                            }
                        }}
                        placeholder="New item..."
                    />
                    <button onClick={addItem}  >Add</button>
                </div>
                <DndContext id="dnd-context" onDragEnd={handleDragEnd}>
                    <div className="task-list-container">
                        <SortableContext id="sortable-context" items={items.map(i => i.id)}>
                            {items.map(item => (
                                <SortableItem
                                    checked={item.done}
                                    key={item.id}
                                    id={item.id}
                                    text={item.text}
                                    deleteItem={deleteItem}
                                    toggleChecked={toggleChecked}
                                    updateItemText={updateItemText}
                                    handleEdit={handleEdit}
                                />
                            ))}
                        </SortableContext>

                    </div>
                </DndContext>
            </main>
            <footer className="footer-button-group">
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
            </footer>
        </>
    );
};

export default App;
