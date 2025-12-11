import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { FC } from 'react';
import type { UniqueIdentifier } from '@dnd-kit/core';

interface SortableItemProps {
    id: UniqueIdentifier;
    deleteItem: (id: UniqueIdentifier) => void;
    text: string;
    updateItemText: (id: UniqueIdentifier, newText: string) => void;
}

export const SortableItem: FC<SortableItemProps> = ({
    id,
    deleteItem,
    text,
    updateItemText
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <li
                key={id}
                style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    marginBottom: 8
                }}
            >
                <input type="checkbox" />
                <span {...listeners} style={{ cursor: "grab" }}>☰</span>

                <input
                    style={{ flex: 1 }}
                    value={text}
                    onChange={(e) => updateItemText(id, e.target.value)}
                />

                <button onClick={(e) => {
                    console.log(id)
                    e.stopPropagation();
                    deleteItem(id)}
                }>
                    ❌
                </button>
            </li>
        </div>
    );
}
