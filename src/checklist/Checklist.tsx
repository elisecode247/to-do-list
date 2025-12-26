import { useState, type FC, type Dispatch, type SetStateAction } from 'react';
import type { ChecklistItem } from 'app/types.ts';
import { ListChecks } from 'lucide-react';
import { DndContext } from '@dnd-kit/core';
import { arrayMove, SortableContext } from '@dnd-kit/sortable';
import type { DragEndEvent, UniqueIdentifier } from '@dnd-kit/core';
import { SortableItem } from 'sortable-item/SortableItem.tsx';
import { formatDate } from 'app/utilities/format-date.ts'
import { updateItemById } from 'checklist/update-item-by-id.ts';

interface ChecklistProps {
    isActiveList: boolean;
    items: Array<ChecklistItem>;
    setActiveItems: Dispatch<SetStateAction<ChecklistItem[]>>;
    setTargetItems: Dispatch<SetStateAction<ChecklistItem[]>>;
    setEditingItem: (checklistItem: ChecklistItem) => void;
}
const Checklist: FC<ChecklistProps> = ({
    isActiveList,
    items,
    setActiveItems,
    setTargetItems,
    setEditingItem
}) => {
    const [inputText, setInputText] = useState<string>("");

    const updateItemText = (id: UniqueIdentifier, newText: string): void => {
        updateItemById(setActiveItems, id, (item: ChecklistItem) => ({ ...item, text: newText }));
    };

    const deleteItem = (id: UniqueIdentifier): void => {
        setActiveItems(prev => prev.filter(item => item.id !== id));
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        setActiveItems((items) => {
            const oldIndex = items.findIndex((item) => item.id === active.id);
            const newIndex = items.findIndex((item) => item.id === over.id);
            if (oldIndex === -1 || newIndex === -1) return items;
            return arrayMove(items, oldIndex, newIndex);
        });
    }

    const toggleChecked = (id: UniqueIdentifier) => {
        updateItemById(setActiveItems, id, item => ({
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
        setActiveItems: React.Dispatch<React.SetStateAction<ChecklistItem[]>>,
        setTargetItems: React.Dispatch<React.SetStateAction<ChecklistItem[]>>
    ) {

        // Remove from active checklist and add to other checklist
        setActiveItems(prev => {
            const item = prev.find(i => i.id === id);
            if (!item) return prev;
            setTargetItems(target =>
                target.some(i => i.id === id) ? target : [...target, item]
            );
            return prev.filter(i => i.id !== id)
        });

    }



    const resetCheckboxes = (): void => {
        setActiveItems(prev => prev.map(item => ({ ...item, done: false })))
    };

    const addItem = (): void => {
        if (!inputText.trim()) return;
        const id = crypto?.randomUUID?.() ?? Date.now().toString();
        setActiveItems(prev => [{ id, text: inputText, done: false, lastCompleted: '', note: '' }, ...prev]);
        setInputText("");
    };

    const moveItem = (id: UniqueIdentifier) => {
        moveItemBetweenLists(id, setActiveItems, setTargetItems);
    };

    return (
        <>
            <div>
                <button onClick={resetCheckboxes}>
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
            <DndContext onDragEnd={handleDragEnd}>
                <div className="task-list-container">
                    <SortableContext items={items.map(i => i.id)}>
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
                                onMoveItem={moveItem}
                            />
                        ))}
                    </SortableContext>

                </div>
            </DndContext>
        </>
    )
}

export default Checklist;
