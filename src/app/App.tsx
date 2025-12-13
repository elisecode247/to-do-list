import { useState, useEffect, useEffectEvent } from 'react';
import type { FC } from 'react';
import { DndContext } from '@dnd-kit/core';
import type { DragEndEvent, UniqueIdentifier } from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext
} from '@dnd-kit/sortable';
import { SortableItem } from '../sortable-item/SortableItem.tsx';
import { ListChecks } from 'lucide-react';
import { isToday } from './utilities/is-today.ts';
import type { ChecklistItem } from './types.ts';
import './app.css';

const App: FC = () => {
    const [items, setItems] = useState<ChecklistItem[]>([]);
    const [inputText, setInputText] = useState<string>("");
    const restoreItemsFromStorage = useEffectEvent(setItems);
    const resetChecked = (): void => {
        setItems(items.map(item => ({ ...item, done: false })))
    };
    const resetAllChecked = useEffectEvent(resetChecked)
    useEffect(() => {
        const storedData = localStorage.getItem('checklist-items');
        const resetDate = localStorage.getItem('reset-checklist-date');

        if (storedData) {
            restoreItemsFromStorage(JSON.parse(storedData));
        }

        if (resetDate) {
            const lastResetDate = new Date(JSON.parse(resetDate));

            if (!isToday(lastResetDate)) {
                resetAllChecked();
                localStorage.setItem('reset-checklist-date', JSON.stringify(new Date()));
            }

        } else {
            localStorage.setItem('reset-checklist-date', JSON.stringify(new Date()));
        }

    }, []);

    useEffect(() => {
        localStorage.setItem("checklist-items", JSON.stringify(items));
    }, [items]);

    const addItem = (): void => {
        if (!inputText.trim()) return;
        const id: UniqueIdentifier = crypto.randomUUID();
        setItems(prev => [{ id, text: inputText, done: false }, ...prev]);
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
        setItems(items.map(item =>
            item.id === id ? { ...item, done: !item.done } : item
        ));
    };

    return (
        <div className="app-root">
            <header>
                <h1 >My To Do List</h1>
            </header>
            <div className="checklist">
            <div >
                <button

                    onClick={resetChecked}
                >
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
                                />
                            )
                        })}
                    </SortableContext>

                </div>
            </DndContext>
            </div>
        </div>
    );
};

export default App;
