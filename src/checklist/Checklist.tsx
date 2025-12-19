import { useState, type FC, type Dispatch, type SetStateAction } from 'react';
import type { ChecklistItem } from '../app/types.ts';
import { ARCHIVED_KEY } from '../app/constants.ts';
import { ListChecks } from 'lucide-react';
import { DndContext } from '@dnd-kit/core';
import { arrayMove, SortableContext } from '@dnd-kit/sortable';
import type { DragEndEvent, UniqueIdentifier } from '@dnd-kit/core';
import { SortableItem } from '../sortable-item/SortableItem.tsx';
import { formatDate } from '../app/utilities/format-date.ts'

interface ChecklistProps {
    items: Array<ChecklistItem>;
    setItems: Dispatch<SetStateAction<ChecklistItem[]>>;
    setEditingItem: (checklistItem: ChecklistItem) => void;
    updateItemById: (
        id: UniqueIdentifier,
        updater: (item: ChecklistItem) => ChecklistItem
    ) => void;}
const Checklist: FC<ChecklistProps> = ({
     items,
     setItems,
     setEditingItem,
     updateItemById
}) => {
    const [inputText, setInputText] = useState<string>("");

    const updateItemText = (id: UniqueIdentifier, newText: string): void => {
        updateItemById(id, (item: ChecklistItem) => ({ ...item, text: newText }));
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

    const handleEdit = (id: UniqueIdentifier) => {
        const selectedItem = items.find(item => item.id === id);
        if (!selectedItem) {
            alert('task not found');
            console.error('task id: ' + id);
            return;
        }

        setEditingItem({ ...selectedItem });
    };

    const handleArchive = (id: UniqueIdentifier) => {
        const item = items.find(item => item.id === id);
        const storedItems = localStorage.getItem(ARCHIVED_KEY);

        if (storedItems) {
            const items = JSON.parse(storedItems);
            if (items.some((item: ChecklistItem) => item.id === id)) {
                console.log('item already archived');
                setItems((prev: ChecklistItem[]) => prev.filter(item => item.id !== id));
                return;
            }
            items.push(item);
            localStorage.setItem(ARCHIVED_KEY, JSON.stringify(items));
            console.log('items saved to local storage')
        } else {
            localStorage.setItem(ARCHIVED_KEY, JSON.stringify([item]));
        }
        setItems(prev => prev.filter(item => item.id !== id));
    }

    const resetChecked = (): void => {
        setItems(prev => prev.map(item => ({ ...item, done: false })))
    };

    const addItem = (): void => {
        if (!inputText.trim()) return;
        const id: UniqueIdentifier = crypto.randomUUID();
        setItems(prev => [{ id, text: inputText, done: false, lastCompleted: '', note: '' }, ...prev]);
        setInputText("");
    };

    return (
        <>
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
                                onArchive={handleArchive}
                            />
                        ))}
                    </SortableContext>

                </div>
            </DndContext>
        </>
    )
}

export default Checklist;
