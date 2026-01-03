import { useSortable } from '@dnd-kit/sortable';
import type { FC } from 'react';
import type { UniqueIdentifier } from '@dnd-kit/core';
import { GripVertical, Trash, Edit, Archive, ListPlus } from 'lucide-react';
import 'sortable-item/sortable-item.css';
import { CSS } from '@dnd-kit/utilities';

interface SortableItemProps {
    id: UniqueIdentifier;
    isActive: boolean;
    checked: boolean;
    deleteItem: (id: UniqueIdentifier) => void;
    text: string;
    lastCompleted: string;
    activeFilter: string;
    toggleChecked: (id: UniqueIdentifier, checked: boolean) => void;
    handleEdit: (id: UniqueIdentifier) => void;
    onMoveItem: (id: UniqueIdentifier) => void;
}

export const SortableItem: FC<SortableItemProps> = ({
    id,
    isActive,
    checked,
    deleteItem,
    text,
    lastCompleted,
    activeFilter,
    toggleChecked,
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
    const showLastCompleted = activeFilter === 'occasional' && !!lastCompleted;

    return (
        <div
            className="sortable-item_drag-wrapper"
            ref={setNodeRef}
            style={style}
            {...attributes}
        >
            <div className="sortable-item_container">
                <button
                    {...listeners}
                    className="sortable-item_drag-handle"
                    aria-label="Drag to reorder task"
                    title="Drag to reorder"
                    type="button"
                >
                    <GripVertical size={16} />
                </button>
                <input
                    className="sortable-item_checkbox"
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => toggleChecked(id, e.target.checked)}
                    aria-label={`Mark task "${text}" as done`}
                    title={checked ? "Mark as not done" : "Mark as done"}
                    onPointerDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                />

                <div className="sortable-item_text-container">
                    <span className="sortable-item_text">{text}</span>
                    {showLastCompleted && (
                        <span className="sortable-item_last-completed-text">
                            {`${new Date(lastCompleted).toDateString()}`}
                        </span>
                    )}
                </div>
                {isActive ? (
                    <button
                        className="sortable-item_archive-button"
                        onClick={() => onMoveItem(id)}
                        aria-label="Archive task"
                        title="Archive task"
                        type="button"
                    >
                        <Archive size={12} />
                    </button>
                ) : (
                    <button
                        className="sortable-item_restore-button"
                        onClick={() => onMoveItem(id)}
                        aria-label="Restore archived task"
                        title="Restore archived task"
                        type="button"
                    >
                        <ListPlus size={12} />
                    </button>
                )}
                <button
                    className="sortable-item_edit-button"
                    onClick={() => handleEdit(id)}
                    aria-label="Edit task"
                    title="Edit task"
                    type="button"
                >
                    <Edit size={12} />
                </button>
                <button
                    className="sortable-item_delete-button"
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
