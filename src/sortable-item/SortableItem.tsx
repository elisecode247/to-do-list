import { useSortable } from '@dnd-kit/sortable';
import { useRef } from 'react';
import type { FC, Dispatch, SetStateAction } from 'react';
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
    EyeClosed,
    Eye,
    PlusCircle,
    UnfoldVertical,
    FoldVertical,
    MoreHorizontal,
    BookPlus,
    BookMinus,
    Star,
} from 'lucide-react';
import { SortableContext } from '@dnd-kit/sortable';
import SortableItemPlaceholder from './SortableItemPlaceholder';
import { TABS } from 'src/checklist/tabs/Tabs';
import { AnimatePresence, motion } from 'framer-motion';

interface SortableItemProps {
    id: UniqueIdentifier;
    activeTab: string;
    hasSubChores?: boolean;
    isActive: boolean;
    isHidden: boolean;
    isHiddenToday: (id: string) => boolean;
    isHideCompleted: boolean;
    checked: boolean;
    deleteItem: (id: UniqueIdentifier) => void;
    prioritizeItem: (id: UniqueIdentifier) => void;
    text: string;
    note: string;
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
    activeTab,
    hasSubChores = false,
    isActive,
    isHidden,
    isHiddenToday,
    isHideCompleted,
    checked,
    deleteItem,
    prioritizeItem,
    text,
    note,
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
    const { attributes, listeners, setNodeRef, transform, transition, isDragging, isOver } =
        useSortable({ id });
    const [openNewTaskForm, setOpenNewTaskForm] = useState(false);
    const [inputText, setInputText] = useState("");
    const [showNotes, setShowNotes] = useState(false);
    const [collapsed, setCollapsed] = useState(true);
    const [dropZoneOpen, setDropZoneOpen] = useState(false);
    const [alignLeft, setAlignLeft] = useState(false);
    const [animate, setAnimate] = useState(true);

    const buttonRef = useRef<HTMLButtonElement>(null);

    const toggleCollapsed = () => setCollapsed(!collapsed);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };
    const showLastCompleted = !!lastCompleted;
    const lastCompletedDate = getDaysFromNow(new Date(lastCompleted));

    const filteredTasks = subtasks?.filter((t) => {
        if (isHiddenToday(t.id as string)) return false;
        if (isHideCompleted && t.done) return false;
        if (isActive === t.isArchived) return false;
        return true;
    });

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

    const updateMenuPosition = () => {
        if (!buttonRef.current) return;

        const buttonRect = buttonRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;

        // Check if button is in the left half of viewport
        const isLeftSide = buttonRect.left < viewportWidth / 2;
        setAlignLeft(isLeftSide);
    };

    async function delayHide() {
        setAnimate(false);
        setTimeout(() => {
            handleHideItem(id, isHidden);
        }, 400);
    }


    async function delayCheck(e: React.ChangeEvent<HTMLInputElement>) {
        let checked = e.target.checked;
        if (checked && isHideCompleted) {
            setAnimate(false);
        }
        setTimeout(() => {
            toggleChecked(id, checked)
            if (checked && tags.includes(PRIORITY_TAG)) onSuccess(true);
        }, 400)
    }

    return (
        <div
            className={`sortable-item_drag-wrapper ${isOver ? 'sortable-item_drag-over' : ''}`}
            ref={setNodeRef}
            style={style}
            {...attributes}
        >
            <AnimatePresence>
                {animate && <motion.div
                    key={`modal-${id}`}
                    initial={{ opacity: 0, scale: 1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ duration: 0.4 }}
                    className={`sortable-item_container ${tags.includes(PRIORITY_TAG) ? 'tag-priority' : ''}`}
                >
                    <div className="sortable-item_main-content">
                        <button
                            {...listeners}
                            className="sortable-item_drag-handle"
                            aria-label="Hold to move and reorder task"
                            title="Hold to move and reorder task"
                            type="button"
                        >
                            <GripVertical size={24} />
                            <span className="sortable-item_drag-handle_label">Move</span>
                        </button>
                        <input
                            className="sortable-item_checkbox"
                            type="checkbox"
                            checked={checked}
                            onChange={delayCheck}
                            aria-label={`Mark task "${text}" as done`}
                            title={checked ? "Mark as not done" : "Mark as done"}
                            onPointerDown={(e) => e.stopPropagation()}
                            onTouchStart={(e) => e.stopPropagation()}
                        />

                        <div className="sortable-item_text-container">
                            <span className="sortable-item_text">
                                {text}
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
                                onClick={() => prioritizeItem(id)}
                                aria-label="Prioritize task"
                                title="Prioritize task"
                                type="button"
                            >
                                {!tags.includes(PRIORITY_TAG) ? (<Star size={24} />) : <Star fill="#ffff00" strokeWidth={0} size={24} />}
                                <span className="sortable-item_button-text-span">Priority</span>
                            </button>

                            {hasSubChores && (
                                <button
                                    className="sortable-item_hide-button"
                                    onClick={toggleCollapsed}
                                    aria-label={collapsed ? "Expand task" : "Collapse task"}
                                >
                                    {collapsed ? <UnfoldVertical size={24} /> : <FoldVertical size={24} />}
                                    <span className="sortable-item_button-text-span">Subtasks</span>
                                </button>
                            )}

                            {!!note?.length && (
                                <button
                                    className="sortable-item_hide-button"
                                    onClick={() => setShowNotes(!showNotes)}
                                    aria-label="Show notes"
                                    title={showNotes ? "Hide notes" : "Show notes"}
                                    type="button"
                                >
                                    {showNotes ? <BookMinus size={24} /> : <BookPlus size={24} />}
                                    <span className="sortable-item_button-text-span">Notes</span>
                                </button>
                            )}
                            {activeTab === TABS.archived ? null : (
                                <button
                                    className="sortable-item_hide-button"
                                    onClick={delayHide}
                                    aria-label="Hide task"
                                    title={isHidden ? "Unhide task for today" : "Hide task for today"}
                                    type="button"
                                >
                                    {isHidden ? <Eye size={24} /> : <EyeClosed size={24} />}
                                    <span className="sortable-item_button-text-span">
                                        {isHidden ? "Unhide Today" : "Hide Today"}
                                    </span>
                                </button>
                            )}

                            <div className="sortable-item_menu-wrapper">
                                <button
                                    className="sortable-item_menu-button sortable-item_edit-button"
                                    aria-label="More task actions"
                                    type="button"
                                    ref={buttonRef}
                                    onMouseEnter={updateMenuPosition}
                                >
                                    <MoreHorizontal size={24} />
                                    <span className="sortable-item_button-text-span">Actions</span>
                                </button>

                                <div
                                    className={`sortable-item_menu-dropdown
                                    ${alignLeft ?
                                            'sortable-item_menu-dropdown--align-left' :
                                            ''
                                        }`
                                    }
                                >
                                    <button
                                        className="sortable-item_edit-button sortable-item_add-subtask-button"
                                        onClick={() => setOpenNewTaskForm(true)}
                                        aria-label="Add subtask"
                                        title="Add subtask"
                                        type="button"
                                    >
                                        <PlusCircle size={24} />
                                        <span className="sortable-item_button-text-span">Add Subtask</span>
                                    </button>

                                    {!hasSubChores && (
                                        <button
                                            className="sortable-item_hide-button"
                                            onClick={() => setDropZoneOpen(!dropZoneOpen)}
                                            aria-label={dropZoneOpen ? "Close subtask dropzone" : "Open subtask dropzone"}
                                        >
                                            {dropZoneOpen ? <UnfoldVertical size={24} /> : <FoldVertical size={24} />}
                                            <span className="sortable-item_button-text-span">
                                                {dropZoneOpen ? "Close Subtask Dropzone" : "Drag and Drop Tasks Here"}
                                            </span>
                                        </button>
                                    )}

                                    <button
                                        className="sortable-item_edit-button"
                                        onClick={() => handleEdit(id)}
                                        aria-label="Edit task"
                                        title="Edit task"
                                        type="button"
                                    >
                                        <Edit size={24} />
                                        <span className="sortable-item_button-text-span">Edit</span>
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
                                            <span className="sortable-item_button-text-span">Archive</span>
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
                                            <span className="sortable-item_button-text-span">Restore</span>
                                        </button>
                                    )}

                                    <button
                                        className="sortable-item_delete-button"
                                        onClick={() => {
                                            const answer = confirm("Are you sure?");
                                            if (!answer) return;
                                            deleteItem(id);
                                        }}
                                        aria-label="Delete task"
                                        title="Delete task"
                                        type="button"
                                    >
                                        <Trash size={24} />
                                        <span className="sortable-item_button-text-span">Delete</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                    {showNotes && (
                        <div className="sortable-item_note">
                            {note}
                        </div>
                    )}
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

                        <SortableContext items={filteredTasks?.map(i => i.id) || []}>
                            {!hasSubChores && dropZoneOpen && (
                                <SortableItemPlaceholder id={id as string} />
                            )}
                            {!collapsed && filteredTasks?.map((subtask) => (
                                <SortableItem
                                    key={subtask.id}
                                    id={subtask.id}
                                    activeTab={activeTab}
                                    hasSubChores={subtask.hasSubChores}
                                    isActive={isActive}
                                    isHidden={isHiddenToday(subtask.id as string)}
                                    isHiddenToday={isHiddenToday}
                                    isHideCompleted={isHideCompleted}
                                    checked={subtask.done}
                                    deleteItem={deleteItem}
                                    prioritizeItem={prioritizeItem}
                                    text={subtask.text}
                                    note={subtask.note}
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

                    </div>
                </motion.div>}
            </AnimatePresence>
        </div>
    );
};
