import { useState, useEffect, useEffectEvent } from 'react';
import type { FC } from 'react';
import './App.css';
import { DndContext } from '@dnd-kit/core';
import type { DragEndEvent, UniqueIdentifier } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext
} from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem.tsx';

interface ChecklistItem {
  id: UniqueIdentifier;
  text: string;
  done: boolean;
}

const Checklist: FC = () => {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [inputText, setInputText] = useState<string>("");

  const restoreItemsFromStorage = useEffectEvent(setItems);

  useEffect(() => {
    const stored = localStorage.getItem("checklist-items");
    if (stored) {
      restoreItemsFromStorage(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("checklist-items", JSON.stringify(items));
  }, [items]);

  const addItem = (): void => {
    if (!inputText.trim()) return;
    const id: UniqueIdentifier = crypto.randomUUID();
    setItems(prev => [...prev, { id, text: inputText, done: false }]);
    setInputText("");
  };

  const updateItemText = (id: UniqueIdentifier, newText: string): void => {
    setItems(items.map(item =>
      item.id === id ? { ...item, text: newText } : item
    ));
  };

  const deleteItem = (id: UniqueIdentifier): void => {
    const newItems = items.filter(item => item.id !== id);
    console.log(newItems)
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

  return (
    <div style={{ maxWidth: 400 }}>
      <h3>Checklist</h3>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="New item..."
        />
        <button onClick={addItem}>Add</button>
      </div>

      <DndContext onDragEnd={handleDragEnd}>
        <div style={{ padding: 0 }}>
          <SortableContext items={items.map(i => i.id)}>
            {items.map(item => {
              return (
                <SortableItem
                  key={item.id}
                  id={item.id}
                  text={item.text}
                  deleteItem={deleteItem}
                  updateItemText={updateItemText}
                />
              )
            })}
          </SortableContext>

        </div>
      </DndContext>
    </div>
  );
};

export default Checklist;
