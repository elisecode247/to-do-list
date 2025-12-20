import { useSortable } from '@dnd-kit/sortable';
import type { FC } from 'react';
import type { UniqueIdentifier } from '@dnd-kit/core';
import { GripVertical, Trash, Edit, Archive, ListPlus } from 'lucide-react';
import './sortable-item.css';
import { CSS } from '@dnd-kit/utilities';

interface SortableItemProps {
    id: UniqueIdentifier;
    isActive: boolean;
    checked: boolean;
    deleteItem: (id: UniqueIdentifier) => void;
    text: string;
    toggleChecked: (id: UniqueIdentifier) => void;
    updateItemText: (id: UniqueIdentifier, newText: string) => void;
    handleEdit: (id: UniqueIdentifier) => void;
    onMoveItem: (id: UniqueIdentifier) => void;
}

export const SortableItem: FC<SortableItemProps> = ({
    id,
    isActive,
    checked,
    deleteItem,
    text,
    toggleChecked,
    updateItemText,
    handleEdit,
    onMoveItem
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
    }
    return (
        <div
            className="task-container"
            ref={setNodeRef}
            style={style}
            {...attributes}
        >
            <div className="task-item">
                <GripVertical
                    {...listeners}
                    size={12}
                    aria-label="Drag to reorder"
                />
                <input
                    className="task-checkbox"
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleChecked(id)}
                    onPointerDown={(e) => e.stopPropagation()}
                />

                <input
                    type="text"
                    value={text}
                    onChange={(e) => updateItemText(id, e.target.value)}
                    onPointerDown={(e) => e.stopPropagation()}
                />
                {isActive ? (
                <button
                    aria-label="Archive item"
                    className='archive-button'
                    onClick={() => onMoveItem(id)}
                    type="button"
                    title="Archive item"
                >
                    <Archive size={12} />
                </button>) : (
                <button
                    aria-label="Restore Archived Item"
                    className='restore-button'
                    onClick={() => onMoveItem(id)}
                    type="button"
                    title="Restore Archived Item"
                >
                    <ListPlus size={12} />
                </button>
                )}
                <button
                    aria-label="Edit item"
                    className='edit-button'
                    onClick={() => handleEdit(id)}
                    type="button"
                >
                    <Edit size={12} />
                </button>
                <button
                    aria-label="Delete item"
                    className='delete-button'
                    onClick={() => deleteItem(id)}
                    type="button"
                >
                    <Trash size={12} />
                </button>
            </div>
        </div>
    );
}
