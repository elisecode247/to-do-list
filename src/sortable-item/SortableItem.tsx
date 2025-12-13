import { useSortable } from '@dnd-kit/sortable';
import type { FC } from 'react';
import type { UniqueIdentifier } from '@dnd-kit/core';
import { GripVertical, Trash } from 'lucide-react';
import './sortable-item.css';
import { CSS } from '@dnd-kit/utilities';

interface SortableItemProps {
    id: UniqueIdentifier;
    checked: boolean;
    deleteItem: (id: UniqueIdentifier) => void;
    text: string;
    toggleChecked: (id: UniqueIdentifier) => void;
    updateItemText: (id: UniqueIdentifier, newText: string) => void;
}

export const SortableItem: FC<SortableItemProps> = ({
    id,
    checked,
    deleteItem,
    text,
    toggleChecked,
    updateItemText
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        // Use CSS utility for performant transforms
        transform: CSS.Transform.toString(transform),
        transition,
        // Apply specific styles when dragging
        opacity: isDragging ? 0.5 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
    }
    return (
        <div
            className="task-container"
            ref={setNodeRef}
            style={style}
            {...attributes}
        >
            <div className="task-item" key={id}>
                <GripVertical
                    {...listeners}
                    size={12}
                />
                <input
                    className="task-checkbox"
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleChecked(id)}
                />

                <input
                    type="text"
                    style={{ width: '100%' }}
                    value={text}
                    onChange={(e) => updateItemText(id, e.target.value)}
                />

                <button
                    className='delete-button'
                    onClick={(e) => {
                        console.log(id)
                        e.stopPropagation();
                        deleteItem(id)
                    }
                }>
                    <Trash size={12} />
                </button>
            </div>
        </div>
    );
}
