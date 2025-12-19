import { useState, type FC, type Dispatch, type SetStateAction } from 'react';
import type { ChecklistItem } from '../app/types.ts';
import { ListChecks } from 'lucide-react';
import { DndContext } from '@dnd-kit/core';
import { arrayMove, SortableContext } from '@dnd-kit/sortable';
import type { DragEndEvent, UniqueIdentifier } from '@dnd-kit/core';
import { SortableItem } from '../sortable-item/SortableItem.tsx';
import { formatDate } from '../app/utilities/format-date.ts'

interface ChecklistProps {
    isActiveList: boolean;
    items: Array<ChecklistItem>;
    setItems: Dispatch<SetStateAction<ChecklistItem[]>>;
    setTargetItems: Dispatch<SetStateAction<ChecklistItem[]>>;
    setEditingItem: (checklistItem: ChecklistItem) => void;
    updateItemById: (
        setList: Dispatch<SetStateAction<ChecklistItem[]>>,
        id: UniqueIdentifier,
        updater: (item: ChecklistItem) => ChecklistItem
    ) => void;
}
const Checklist: FC<ChecklistProps> = ({
    isActiveList,
    items,
    setItems,
    setTargetItems,
    setEditingItem,
    updateItemById
}) => {
    const [inputText, setInputText] = useState<string>("");

    const updateItemText = (id: UniqueIdentifier, newText: string): void => {
        updateItemById(setItems, id, (item: ChecklistItem) => ({ ...item, text: newText }));
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
        updateItemById(setItems, id, item => ({
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

    function moveItemBetweenLists(
        id: UniqueIdentifier,
        sourceItems: ChecklistItem[],
        setSourceItems: React.Dispatch<React.SetStateAction<ChecklistItem[]>>,
        setTargetItems: React.Dispatch<React.SetStateAction<ChecklistItem[]>>
    ) {
        const item = sourceItems.find(i => i.id === id);
        if (!item) return;

        // Remove from source
        setSourceItems(prev => prev.filter(i => i.id !== id));

        // Add to target
        setTargetItems(prev => {
            if (prev.some(i => i.id === id)) return prev;
            return [...prev, item];
        });
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

    const handleArchive = (id: UniqueIdentifier) =>
        moveItemBetweenLists(
            id,
            items,
            setItems,
            setTargetItems
        );

    const handleRestore = (id: UniqueIdentifier) =>
        moveItemBetweenLists(
            id,
            items,
            setItems,
            setTargetItems
        );

    return (
        <>
            <div data-items={JSON.stringify(items)}>
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
                                isActive={isActiveList}
                                checked={item.done}
                                key={item.id}
                                id={item.id}
                                text={item.text}
                                deleteItem={deleteItem}
                                toggleChecked={toggleChecked}
                                updateItemText={updateItemText}
                                handleEdit={handleEdit}
                                onArchive={handleArchive}
                                onRestore={handleRestore}
                            />
                        ))}
                    </SortableContext>

                </div>
            </DndContext>
        </>
    )
}

export default Checklist;
