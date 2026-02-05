import { useSortable } from '@dnd-kit/sortable';
import type { FC, Dispatch, SetStateAction, } from 'react';
import { useState } from 'react';
import type { UniqueIdentifier } from '@dnd-kit/core';
import 'sortable-item/sortable-item.css';
import { CSS } from '@dnd-kit/utilities';
import { PRIORITY_TAG, type Tag } from 'src/checklist/constants';
import { getDaysFromNow } from 'src/utilities/days-ago';
import type { ChecklistItem } from 'src/app/types.ts';
import { useTask } from 'src/app/use-task';
import { useToast } from 'src/toast/use-toast.tsx';
import {
    GripVertical,
    Trash,
    Edit,
    Archive,
    ListPlus,
    Star,
    EyeClosed,
    Eye,
    PlusCircle,
    UnfoldVertical,
    FoldVertical,
    MoreHorizontal
} from 'lucide-react';
import { SortableContext } from '@dnd-kit/sortable';

interface SortableItemProps {
    id: UniqueIdentifier;
    hasSubChores?: boolean;
    isActive: boolean;
    isHidden: boolean;
    checked: boolean;
    deleteItem: (id: UniqueIdentifier) => void;
    prioritizeItem: (id: UniqueIdentifier) => void;
    text: string;
    lastCompleted: string;
    toggleChecked: (id: UniqueIdentifier, checked: boolean) => void;
    handleEdit: (id: UniqueIdentifier) => void;
    handleHideItem: (id: UniqueIdentifier, isHiddenItem: boolean) => void;
    onMoveItem: (id: UniqueIdentifier) => void;
    onSuccess: Dispatch<SetStateAction<boolean>>;
    tags: Array<Tag>
    subtasks?: ChecklistItem[];
}

export const SortableItem: FC<SortableItemProps> = ({
    id,
    hasSubChores = false,
    isActive,
    isHidden,
    checked,
    deleteItem,
    prioritizeItem,
    text,
    lastCompleted,
    toggleChecked,
    handleEdit,
    handleHideItem,
    onMoveItem,
    tags,
    onSuccess,
    subtasks,
}) => {
    const { getSubtasks, addItem } = useTask();
    const { showToast } = useToast();
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id });
    const [collapsed, setCollapsed] = useState(true);
    const toggleCollapsed = () => setCollapsed(!collapsed);
    const [menuOpen, setMenuOpen] = useState(false);
    const [openNewTaskForm, setOpenNewTaskForm] = useState(false);
    const [inputText, setInputText] = useState("");

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };
    const showLastCompleted = !!lastCompleted;
    const lastCompletedDate = getDaysFromNow(new Date(lastCompleted));
    const priorityStyle = tags.includes(PRIORITY_TAG) ? 'yellow' : 'none';

    async function handleAdd(id: UniqueIdentifier) {
        if (!inputText.trim()) {
            showToast('Task details cannot be empty.', 'error');
            return;
        }
        const newChecklistItem: ChecklistItem = {
            id: crypto.randomUUID(),
            text: inputText,
            done: false,
            lastCompleted: '',
            note: '',
            sortOrder: 0,
            category: '',
            tags: [],
            isHidden: false,
            isArchived: false,
            hasSubChores: false,
            parentUuid: id
        };
        try {
            await addItem(newChecklistItem);
            setOpenNewTaskForm(false);
            setCollapsed(false);
            setInputText('');
            showToast('Task added successfully', 'success');
        } catch {
            showToast('Failed to add task. Please try again.', 'error');
        }
    }

    return (
        <div
            className="sortable-item_drag-wrapper"
            ref={setNodeRef}
            style={style}
            {...attributes}
        >
            <div className={`sortable-item_container ${tags.includes(PRIORITY_TAG) ? 'tag-priority' : ''}`}>
                <div className="sortable-item_main-content">
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
                        {hasSubChores && (
                            <button
                                className="sortable-item_hide-button"
                                onClick={toggleCollapsed}
                                aria-label={collapsed ? "Expand task" : "Collapse task"}
                            >
                                {collapsed ? <UnfoldVertical size={24} /> : <FoldVertical size={24} />}
                            </button>
                        )}
                        <button
                            className="sortable-item_hide-button"
                            onClick={() => handleHideItem(id, isHidden)}
                            aria-label="Hide task"
                            title={isHidden ? "Unhide task for today" : "Hide task for today"}
                            type="button"
                        >
                            {isHidden ? <Eye size={24} /> : <EyeClosed size={24} />}
                        </button>
                        {menuOpen && (
                            <>
                                <button
                                    className="sortable-item_edit-button sortable-item_add-subtask-button"
                                    onClick={() => setOpenNewTaskForm(true)}
                                    aria-label="Add subtask"
                                    title="Add subtask"
                                    type="button"
                                >
                                    <PlusCircle size={24} />
                                </button>
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
                            </>
                        )}
                        <button
                            className="sortable-item_menu-button sortable-item_edit-button"
                            onClick={() => setMenuOpen(!menuOpen)}
                            aria-label="More actions"
                        >
                            <MoreHorizontal size={24} />
                        </button>
                    </div>
                </div>
                {openNewTaskForm ? (
                    <div className="sortable-item_new-item-form">
                        <h3>New Task</h3>
                        <button
                            className="sortable-item_new-item-close-button"
                            onClick={() => setOpenNewTaskForm(false)}
                            aria-label="Close"
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </button>
                        <div className="sortable-item_new-item-input-container">
                        <input
                            className="sortable-item_new-item-input"
                            type="text"
                            placeholder="Task details..."
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => {
                                e.stopPropagation();
                                if (e.key === 'Enter') {
                                    handleAdd(id);
                                }
                            }}
                        />
                        <button
                            className="sortable-item_new-item-add-button"
                            onClick={() => handleAdd(id)}
                        >
                            Add
                        </button>
                        </div>
                    </div>
                ) : null}
                {/* RECURSIVE SUBTASKS */}
                <div className="sortable-item_subtasks-container">
                    {!collapsed && (
                        <SortableContext items={subtasks?.map(i => i.id) || []}>
                            {subtasks?.filter((t) => t.isArchived !== isActive)?.map((subtask) => (
                                <SortableItem
                                    key={subtask.id}
                                    id={subtask.id}
                                    hasSubChores={subtask.hasSubChores}
                                    isActive={isActive}
                                    isHidden={false}
                                    checked={subtask.done}
                                    deleteItem={deleteItem}
                                    prioritizeItem={prioritizeItem}
                                    text={subtask.text}
                                    lastCompleted={subtask.lastCompleted}
                                    toggleChecked={toggleChecked}
                                    handleEdit={handleEdit}
                                    handleHideItem={handleHideItem}
                                    onMoveItem={onMoveItem}
                                    tags={subtask.tags as Tag[]}
                                    onSuccess={onSuccess}
                                    subtasks={getSubtasks(subtask.id)}
                                />
                            ))}
                        </SortableContext>
                    )}
                </div>
            </div>
        </div>
    );
};
