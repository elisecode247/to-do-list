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
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            className="task-container"
            ref={setNodeRef}
            style={style}
            {...attributes}
        >
            <div className="task-item">
                <button
                    {...listeners}
                    className="drag-handle"
                    aria-label="Drag to reorder task"
                    title="Drag to reorder"
                    type="button"
                >
                    <GripVertical size={16} />
                </button>
                <input
                    className="task-checkbox"
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleChecked(id)}
                    aria-label={`Mark task "${text}" as done`}
                    title={checked ? "Mark as not done" : "Mark as done"}
                    onPointerDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                />

                <input
                    type="text"
                    value={text}
                    onChange={(e) => updateItemText(id, e.target.value)}
                    aria-label={`Edit task: ${text}`}
                    title="Edit task"
                    onPointerDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    className="task-text-input"
                />
                {isActive ? (
                    <button
                        className="archive-button"
                        onClick={() => onMoveItem(id)}
                        aria-label="Archive task"
                        title="Archive task"
                        type="button"
                    >
                        <Archive size={12} />
                    </button>
                ) : (
                    <button
                        className="restore-button"
                        onClick={() => onMoveItem(id)}
                        aria-label="Restore archived task"
                        title="Restore archived task"
                        type="button"
                    >
                        <ListPlus size={12} />
                    </button>
                )}
                <button
                    className="edit-button"
                    onClick={() => handleEdit(id)}
                    aria-label="Edit task"
                    title="Edit task"
                    type="button"
                >
                    <Edit size={12} />
                </button>
                <button
                    className="delete-button"
                    onClick={() => deleteItem(id)}
                    aria-label="Delete task"
                    title="Delete task"
                    type="button"
                >
                    <Trash size={12} />
                </button>
            </div>
        </div>
    );
};
