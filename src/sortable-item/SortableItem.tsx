import { useSortable } from '@dnd-kit/sortable';
import { useRef } from 'react';
import type { FC, Dispatch, SetStateAction, RefObject } from 'react';
import { useState } from 'react';
import 'sortable-item/sortable-item.css';
import { CSS } from '@dnd-kit/utilities';
import { getDaysAgo, getDaysFromNow } from 'src/utilities/days-ago';
import type { ChecklistItem, Mode } from 'src/app/types';
import { useTask } from 'src/app/use-task';
import { useToast } from 'src/toast/use-toast';
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
import { TAB_ARCHIVED, TABS } from 'src/app-toolbar/tabs/types';
import { AnimatePresence, motion } from 'framer-motion';
import NoteEditor from 'src/editor/NoteEditor';
import { type MDXEditorMethods } from '@mdxeditor/editor';
import { useOnClickOutside } from 'usehooks-ts';

interface SortableItemProps {
    id: string;
    activeTab: string;
    hasSubChores?: boolean;
    isSubChore?: boolean;
    isActive: boolean;
    isHidden: boolean;
    isHideCompleted: boolean;
    checked: boolean;
    deleteItem: (id: string) => void;
    prioritizeItem: (id: string) => void;
    text: string;
    note: string;
    mode: Mode;
    category: string;
    lastCompleted: string;
    toggleChecked: (id: string, checked: boolean) => void;
    handleEdit: (id: string) => void;
    handleHideItem: (id: string, isHiddenItem: boolean) => void;
    onMoveItem: (id: string) => void;
    onSuccess: Dispatch<SetStateAction<boolean>>;
    isPriority: boolean;
    subtasks?: ChecklistItem[];
    nextDue?: string | null;
}

export const SortableItem: FC<SortableItemProps> = ({
    id,
    activeTab,
    hasSubChores = false,
    isSubChore = false,
    isActive,
    isHidden,
    isHideCompleted,
    checked,
    deleteItem,
    prioritizeItem,
    text,
    note,
    mode,
    category,
    lastCompleted,
    toggleChecked,
    handleEdit,
    handleHideItem,
    onMoveItem,
    isPriority,
    onSuccess,
    subtasks,
    nextDue,
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
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuDropdownRef = useRef<HTMLElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const noteRef = useRef<MDXEditorMethods>(null)


    const toggleNotes = () => {
        setShowNotes(!showNotes);
        setCollapsed(true);
        setOpenNewTaskForm(false);
    }

    const toggleCollapsed = () => {
        setCollapsed(!collapsed);
        setShowNotes(false);
        setOpenNewTaskForm(false);
    }

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };
    const showLastCompleted = !!lastCompleted;
    const lastCompletedDate = getDaysAgo(new Date(lastCompleted));
    const nextDueDate = nextDue ? getDaysFromNow(new Date(nextDue)) : null;

    const filteredTasks = subtasks?.filter((t) => {
        if (t.isHidden || t.isArchived) return false;
        if (isHideCompleted && t.done) return false;
        return true;
    });

    async function handleAdd(id: string) {
        if (!inputText.trim()) {
            showToast('Task details cannot be empty.', 'error');
            return;
        }
        // inherit parent task's category and mode, but not priority or hidden status
        const newChecklistItem: ChecklistItem = {
            itemType: 'checklist-item',
            id: crypto.randomUUID(),
            text: inputText,
            done: false,
            lastCompleted: '',
            note: '',
            sortOrder: 0,
            tabSortOrder: {},
            categoryUuid: null,
            category: category,
            mode: mode,
            isPriority: false,
            isHidden: false,
            isArchived: false,
            hasSubChores: false,
            parentUuid: id,
            recurrence: null,
            nextDue: null
        };
        try {
            await addItem(newChecklistItem);
            setOpenNewTaskForm(false);
            setCollapsed(true);
            setInputText('');
            showToast('Task added successfully', 'success');
        } catch {
            showToast('Failed to add task. Please try again.', 'error');
        }
    }

    const updateMenuPosition = () => {
        if (!buttonRef.current) return;
        setIsMenuOpen(!isMenuOpen);

        const buttonRect = buttonRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;

        // Check if button is in the left half of viewport
        const isLeftSide = buttonRect.left < viewportWidth / 2;
        setAlignLeft(isLeftSide);

        // Position dropdown above the button if it's on the bottom of the viewport
        const dropdownHeight = 260; // to be above bottom app menu
        const spaceBelow = window.innerHeight - buttonRect.bottom;
        const dropdown = menuDropdownRef.current;

        if (dropdown) {
            if (spaceBelow < dropdownHeight) {
                dropdown.style.bottom = '45px'; // button height
                dropdown.style.top = 'auto';

            } else {
                dropdown.style.top = "100%";
                dropdown.style.bottom = 'auto';
            }
        }
    };

    async function delayHide() {
        setAnimate(false);
        setTimeout(() => {
            handleHideItem(id, isHidden);
        }, 400);
    }


    async function delayCheck(e: React.ChangeEvent<HTMLInputElement>) {
        const checked = e.target.checked;
        if (checked && isHideCompleted) {
            setAnimate(false);
        }
        setTimeout(() => {
            toggleChecked(id, checked)
            if (checked && isPriority) onSuccess(true);
        }, 400)
    }

    async function handleDeleteTask() {
        const answer = confirm("Are you sure?");
        if (!answer) return;
        try {
            await deleteItem(id);
            showToast('Task deleted successfully', 'success');
        } catch (err) {
            console.error('Failed to delete task:', err);
            showToast('Failed to delete task. Please try again.', 'error');
        }
    }

    function handleOpenTaskForm() {
        setOpenNewTaskForm(!openNewTaskForm);
        setShowNotes(false);
        setCollapsed(true);
    }

    function toggleMenuOpen() {
        if (!isMenuOpen) {
            updateMenuPosition();
        } else {
            setIsMenuOpen(false);
        }
    }
    function handleClickOutsideMenu () {
        setIsMenuOpen(false);
    }
    useOnClickOutside(menuDropdownRef as RefObject<HTMLElement>, handleClickOutsideMenu)

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
                    className={`sortable-item_container ${isPriority ? 'mode-priority' : ''}`}
                >
                    <button
                        {...listeners}
                        className="sortable-item_drag-handle"
                        aria-label="Hold to move and reorder task"
                        title="Hold to move and reorder task"
                        type="button"
                    >
                        <GripVertical size={24} />
                    </button>
                    <div className="sortable-item_main-content">

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
                                {isSubChore && <span className="sortable-item_subtask-indicator">Subtask: </span>}
                                {text}
                                {showLastCompleted && (
                                    <span className="sortable-item_last-completed-text">
                                        {lastCompletedDate}
                                    </span>
                                )}
                                {activeTab === TABS.upcoming && nextDue && (
                                    <span className="sortable-item_next-due-text">
                                        {nextDueDate}
                                    </span>
                                )}
                            </span>
                        </div>
                    </div>
                    <div className="sortable-item_button-group-container">
                        <button
                            className="sortable-item_priority-button"
                            onClick={() => prioritizeItem(id)}
                            aria-label="Prioritize task"
                            title="Prioritize task"
                            type="button"
                        >
                            {!isPriority ? (<Star size={24} />) : <Star fill="#ffff00" strokeWidth={0} size={24} />}
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
                                onClick={toggleNotes}
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
                                    {isHidden ? "Move to Today" : "Not Today"}
                                </span>
                            </button>
                        )}

                        <div className="sortable-item_menu-wrapper">
                            <button
                                className={`sortable-item_menu-button
                                    ${isMenuOpen ? 'sortable-item_menu-button--active' : ''}`}
                                aria-label="More task actions"
                                type="button"
                                ref={buttonRef}
                                onClick={toggleMenuOpen}
                            >
                                <MoreHorizontal size={24} />
                                <span className="sortable-item_button-text-span">Actions</span>
                            </button>

                            <div
                                ref={menuDropdownRef as RefObject<HTMLDivElement>}
                                className={`sortable-item_menu-dropdown
                                    ${isMenuOpen ? 'sortable-item_menu-dropdown--open' : ''}
                                    ${alignLeft ?
                                        'sortable-item_menu-dropdown--align-left' :
                                        ''
                                    }`
                                }
                            >
                                <button
                                    className="sortable-item_edit-button sortable-item_add-subtask-button"
                                    onClick={handleOpenTaskForm}
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
                                    onClick={() => {
                                        handleEdit(id);
                                        setIsMenuOpen(false);
                                    }}
                                    aria-label="Edit task"
                                    title="Edit task"
                                    type="button"
                                >
                                    <Edit size={24} />
                                    <span className="sortable-item_button-text-span">Edit</span>
                                </button>

                                {activeTab !== TAB_ARCHIVED ? (
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
                                    onClick={handleDeleteTask}
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
                    {showNotes && (
                        <div className="sortable-item_note">
                            <NoteEditor
                                key={note} // force remount to reset internal state when note changes
                                initialMarkdown={note ?? ''}
                                ref={noteRef}
                                readOnly={true}
                            />
                        </div>
                    )}
                    {openNewTaskForm ? (
                        <div className="sortable-item_new-item-form">
                            <h3>New Task</h3>
                            <button
                                className="sortable-item_new-item-close-button"
                                onClick={handleOpenTaskForm}
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
                            {!collapsed && hasSubChores && filteredTasks?.length === 0 && (
                                <div className="sortable-item_no-subtasks">
                                    No subtasks to show. You have hidden or completed subtasks.<br/>
                                    Adjust filters or go to "Not Today" tab to see all subtasks.
                                </div>
                            )}
                            {!collapsed && filteredTasks?.map((subtask) => (
                                <SortableItem
                                    key={subtask.id}
                                    id={subtask.id}
                                    activeTab={activeTab}
                                    hasSubChores={subtask.hasSubChores}
                                    isActive={isActive}
                                    isHidden={subtask.isHidden}
                                    isHideCompleted={isHideCompleted}
                                    checked={subtask.done}
                                    deleteItem={deleteItem}
                                    prioritizeItem={prioritizeItem}
                                    text={subtask.text}
                                    note={subtask.note}
                                    mode={subtask.mode}
                                    category={subtask.category}
                                    lastCompleted={subtask.lastCompleted}
                                    toggleChecked={toggleChecked}
                                    handleEdit={handleEdit}
                                    handleHideItem={handleHideItem}
                                    onMoveItem={onMoveItem}
                                    isPriority={subtask.isPriority}
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
