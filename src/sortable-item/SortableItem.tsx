import { useSortable } from '@dnd-kit/sortable';
import type { FC, Dispatch, SetStateAction } from 'react';
import type { UniqueIdentifier } from '@dnd-kit/core';
import { GripVertical, Trash, Edit, Archive, ListPlus, Star } from 'lucide-react';
import 'sortable-item/sortable-item.css';
import { CSS } from '@dnd-kit/utilities';
import { PRIORITY_TAG, type Tag } from 'src/checklist/constants';
import { getDaysFromNow } from 'src/utilities/days-ago';
interface SortableItemProps {
    id: UniqueIdentifier;
    isActive: boolean;
    checked: boolean;
    deleteItem: (id: UniqueIdentifier) => void;
    prioritizeItem: (id: UniqueIdentifier) => void;
    text: string;
    lastCompleted: string;
    activeFilters: Array<Tag>;
    toggleChecked: (id: UniqueIdentifier, checked: boolean) => void;
    handleEdit: (id: UniqueIdentifier) => void;
    onMoveItem: (id: UniqueIdentifier) => void;
    onSuccess: Dispatch<SetStateAction<boolean>>;
    tags: Array<Tag>
}

export const SortableItem: FC<SortableItemProps> = ({
    id,
    isActive,
    checked,
    deleteItem,
    prioritizeItem,
    text,
    lastCompleted,
    activeFilters,
    toggleChecked,
    handleEdit,
    onMoveItem,
    tags,
    onSuccess
}) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };
    const showLastCompleted = !!lastCompleted;
    const lastCompletedDate = getDaysFromNow(new Date(lastCompleted));
    const priorityStyle = tags.includes(PRIORITY_TAG) ? 'yellow' : 'none';

    return (
        <div
            className="sortable-item_drag-wrapper"
            ref={setNodeRef}
            style={style}
            {...attributes}
        >
            <div className={`sortable-item_container ${tags.includes(PRIORITY_TAG) ? 'tag-priority' : ''}`}>
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
                    onChange={(e) => {
                        toggleChecked(id, e.target.checked)
                        if (e.target.checked && tags.includes(PRIORITY_TAG)) onSuccess(true);
                    }}
                    aria-label={`Mark task "${text}" as done`}
                    title={checked ? "Mark as not done" : "Mark as done"}
                    onPointerDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                />

                <div className="sortable-item_text-container">
                    <span className="sortable-item_text">
                        {tags.includes(PRIORITY_TAG) && '⭐ '}{text}
                        {showLastCompleted && (
                            <span className="sortable-item_last-completed-text">
                                {lastCompletedDate}
                            </span>
                        )}
                    </span>
                </div>
                <div className="sortable-item_button-group-container">
                    <button
                        className="sortable-item_edit-button"
                        onClick={() => handleEdit(id)}
                        aria-label="Edit task"
                        title="Edit task"
                        type="button"
                    >
                        <Edit size={24} />
                    </button>
                    {isActive ? (
                        <button
                            className="sortable-item_archive-button"
                            onClick={() => onMoveItem(id)}
                            aria-label="Archive task"
                            title="Archive task"
                            type="button"
                        >
                            <Archive size={24} />
                        </button>
                    ) : (
                        <button
                            className="sortable-item_restore-button"
                            onClick={() => onMoveItem(id)}
                            aria-label="Restore archived task"
                            title="Restore archived task"
                            type="button"
                        >
                            <ListPlus size={24} />
                        </button>
                    )}
                    <button
                        className="sortable-item_delete-button"
                        onClick={() => {
                            const answer = confirm('Are you sure?');
                            if (!answer) return;
                            deleteItem(id)
                        }}
                        aria-label="Delete task"
                        title="Delete task"
                        type="button"
                    >
                        <Trash size={24} />
                    </button>
                    <button
                        className="sortable-item_priority-button"
                        onClick={() => {
                            prioritizeItem(id)
                        }}
                        aria-label="Prioritize task"
                        title="Prioritize task"
                        type="button"
                    >
                        <Star size={24} fill={priorityStyle} />
                    </button>
                </div>
            </div>
        </div>
    );
};
