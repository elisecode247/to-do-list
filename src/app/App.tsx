import { useState } from 'react';
import type { FC } from 'react';
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

const App: FC = () => {
    const [items, setItems] = usePersistedChecklist();
    const [inputText, setInputText] = useState<string>("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        id: '' as UniqueIdentifier,
        text: '',
        done: false,
        lastCompleted: '',
        note: ''
    } as ChecklistItem);
    const resetChecked = (): void => {
        setItems(items.map(item => ({ ...item, done: false })))
    };

    const addItem = (): void => {
        if (!inputText.trim()) return;
        const id: UniqueIdentifier = crypto.randomUUID();
        setItems(prev => [{ id, text: inputText, done: false, lastCompleted: '', note: '' }, ...prev]);
        setInputText("");
    };

    const updateItemText = (id: UniqueIdentifier, newText: string): void => {
        setItems(items.map(item =>
            item.id === id ? { ...item, text: newText } : item
        ));
    };

    const deleteItem = (id: UniqueIdentifier): void => {
        const newItems = items.filter(item => item.id !== id);
        setItems(newItems);
    };

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (over?.id && active.id !== over?.id) {
            setItems((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);

                return arrayMove(items, oldIndex, newIndex);
            });
        }
    }
    const toggleChecked = (id: UniqueIdentifier): void => {
        const now = new Date();
        const formatted = now.getFullYear() + '-' +
            String(now.getMonth() + 1).padStart(2, '0') + '-' +
            String(now.getDate()).padStart(2, '0');

        setItems(items.map(item =>
            item.id === id ? {
                ...item,
                done: !item.done,
                lastCompleted: formatted
            } : item
        ));
    };

    const copyData = async function copyData() {
        const storedItems = localStorage.getItem(ITEMS_KEY);
        if (!storedItems) {
            alert('No data to copy');
            return;
        }
        try {
            await navigator.clipboard.writeText(storedItems);
            alert('data successfully copied to clipboard');
        } catch (err) {
            alert('Could not copy text: ' + err);
        }
    }

    const uploadData = function () {
        const data = prompt('Paste data here');
        try {
            if (!data) {
                alert('No data was pasted');
                return;
            }
            const parsedData = JSON.parse(data.trim());
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
        setFormData({
            id: selectedItem.id,
            done: selectedItem.done,
            text: selectedItem.text,
            lastCompleted: selectedItem.lastCompleted || '',
            note: selectedItem.note
        });
        setIsModalOpen(true);
    };

    const handleSave = () => {
        console.log(formData)
        setItems(items.map(item =>
            item.id === formData.id ? {
                ...item,
                text: formData.text,
                lastCompleted: formData.lastCompleted,
                note: formData.note
            } : item
        ));
        setIsModalOpen(false);
    }
    return (
        <>
            {isModalOpen ? (
                <ItemModal
                    formData={formData}
                    setFormData={setFormData}
                    onSave={handleSave}
                    onClose={() => setIsModalOpen(false)}
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
                            {items.map(item => {
                                return (
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
                                )
                            })}
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
