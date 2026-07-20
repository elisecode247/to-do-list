import { useSortable } from '@dnd-kit/sortable';
import { useEffect, useRef } from 'react';
import type { FC, Dispatch, SetStateAction, RefObject } from 'react';
import { useState } from 'react';
import 'sortable-item/sortable-item.css';
import { CSS } from '@dnd-kit/utilities';
import { getDaysAgo, getDaysFromNow } from 'src/utilities/days-ago';
import type { ChecklistItem, ChoreAccessRole, Mode } from 'src/app/types';
import { useToast } from 'src/toast/use-toast';
import {
    Ban,
    Calendar1,
    CalendarPlus2,
    GripVertical,
    Trash,
    Edit,
    Archive,
    ListPlus,
    PlusCircle,
    Expand,
    Minimize2,
    MoreHorizontal,
    BookPlus,
    BookMinus,
    Star,
    ListChevronsDownUp,
    ListChevronsUpDown,
    RefreshCw,
    ChevronRight,
    Users,
} from 'lucide-react';
import { SortableContext } from '@dnd-kit/sortable';
import SortableItemPlaceholder from './SortableItemPlaceholder';
import { TAB_ARCHIVED, TABS } from 'src/app-toolbar/tabs/types';
import { AnimatePresence, motion } from 'framer-motion';
import NoteEditor from 'src/editor/LazyNoteEditor';
import { type MDXEditorMethods } from '@mdxeditor/editor';
import { useOnClickOutside, useDebounceCallback } from 'usehooks-ts';
import IconButton from 'src/components/icon-button/IconButton';
import type { IntervalRecurrence, OneTimeRecurrence } from 'src/app/types';
import { getRecurrenceText } from 'src/sortable-item/utilities/get-recurrence-text';
import { useUserSettings } from 'src/user-settings/use-user-settings';
import { getCategoryById } from 'src/category-select/category-constants';
import { CategoryIcon } from 'src/category-select/category-icons';
import {
    canCompleteTask,
    canDeleteTask,
    canEditTask,
} from 'src/sharing/chore-access';
import { isChoreAccessChangedError } from 'src/app/api';

interface SortableItemProps {
    checklistType?: 'task' | 'template' | 'search-results';
    id: string;
    activeTab: string;
    hasSubChores?: boolean;
    isSubChore?: boolean;
    parentUuid?: string | null;
    isArchived?: boolean;
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
    onMoveItem: (id: string, isArchived: boolean) => void;
    onSuccess: Dispatch<SetStateAction<boolean>>;
    isPriority: boolean;
    subtasks: ChecklistItem[];
    nextDue: string | null;
    addItem?: (item: ChecklistItem) => Promise<void> | void;
    partialUpdateItem?: (item: Partial<ChecklistItem>) => Promise<void> | void;
    getSubtasks?: (parentId: string) => ChecklistItem[];
    isUpcomingSubtask?: boolean;
    recurrence: IntervalRecurrence | OneTimeRecurrence | null;
    accessRole?: ChoreAccessRole;
    hasMembers: boolean;
    expandedNoteItemIds?: ReadonlySet<string>;
    itemLookup?: ReadonlyMap<string, ChecklistItem>;
}

export const SortableItem: FC<SortableItemProps> = ({
    checklistType = 'task',
    id,
    activeTab,
    hasSubChores = false,
    isSubChore = false,
    parentUuid,
    isArchived = false,
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
    isUpcomingSubtask = false,
    addItem,
    partialUpdateItem,
    getSubtasks = () => [],
    recurrence,
    accessRole,
    hasMembers,
    expandedNoteItemIds,
    itemLookup,
}) => {
    const { showToast } = useToast();
    const { categories } = useUserSettings();
    const {
        attributes,
        listeners,
        setActivatorNodeRef,
        setNodeRef,
        transform,
        transition,
        isDragging,
        isOver,
    } = useSortable({ id });
    const [openNewTaskForm, setOpenNewTaskForm] = useState(false);
    const [inputText, setInputText] = useState("");
    const [showNotes, setShowNotes] = useState(expandedNoteItemIds?.has(id) ? true : false);
    const [collapsed, setCollapsed] = useState(checklistType !== 'template');
    const [dropZoneOpen, setDropZoneOpen] = useState(false);
    const [alignLeft, setAlignLeft] = useState(false);
    const [animate, setAnimate] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showUpcoming, setShowUpcoming] = useState(false);
    const dragWrapperRef = useRef<HTMLDivElement>(null);
    const menuDropdownRef = useRef<HTMLElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const noteRef = useRef<MDXEditorMethods>(null)
    const effectiveAccessRole = accessRole ?? 'owner';
    const canEdit = canEditTask(effectiveAccessRole);
    const canComplete = canCompleteTask(effectiveAccessRole);
    const canDelete = canDeleteTask(effectiveAccessRole);
    const canAddSubtask = checklistType === 'template' || effectiveAccessRole === 'owner';
    const hasMenuActions = canEdit || canDelete || canAddSubtask;
    const priorityBtnTitle = isPriority ? "Un-prioritize task" : "Prioritize task";
    const accessDescriptionId = `task-access-${id}`;

    const toggleNotes = () => {
        setShowNotes(!showNotes);
        setOpenNewTaskForm(false);
    }

    const toggleCollapsed = () => {
        setCollapsed(!collapsed);
    }

    useEffect(() => {
        const node = dragWrapperRef.current;
        if (!node) return;

        node.style.transform = CSS.Transform.toString(transform) ?? '';
        node.style.transition = transition ?? '';
        node.style.opacity = isDragging ? '0.5' : '1';
    }, [transform, transition, isDragging]);

    const setDragWrapperRef = (node: HTMLDivElement | null) => {
        dragWrapperRef.current = node;
        setNodeRef(node);
    };

    const showLastCompleted = !!lastCompleted;
    const lastCompletedDate = getDaysAgo(new Date(lastCompleted));
    const nextDueDate = nextDue ? getDaysFromNow(new Date(nextDue)) : null;
    const categoryDefinition = getCategoryById(categories, category);
    const parentTask = parentUuid ? itemLookup?.get(parentUuid) : undefined;

    const filteredTasks = subtasks?.filter((t) => {
        if (t.isHidden || t.isArchived) return false;
        if (isHideCompleted && t.done) return false;
        if (activeTab === TABS.today && t.upcoming) {
            return false;
        }
        return true;
    });

    const upcomingTasks = subtasks?.filter((t) => t.upcoming === true);

    const saveNote = async () => {
        if (!canEdit) return;

        try {
            await partialUpdateItem?.({ id, note: noteRef.current?.getMarkdown() ?? '' });
            showToast('Notes saved successfully', 'success');
        } catch (error) {
            console.error('Failed to save note:', error);
            if (!isChoreAccessChangedError(error)) {
                showToast('Failed to save note. Please try again.', 'error');
            }
        }
    };

    const debouncedSaveNote = useDebounceCallback(saveNote, 1000);

    const handleNoteChange = () => {
        debouncedSaveNote();
    };

    async function handleAdd(id: string) {
        if (!canAddSubtask) return;

        if (!inputText.trim()) {
            showToast('Task details cannot be empty.', 'error');
            return;
        }
        // inherit parent task's category and mode, but not priority or hidden status
        const newChecklistItem: ChecklistItem = {
            isOwner: true,
            hasMembers: false,
            accessRole: 'owner',
            itemType: 'checklist-item',
            id: crypto.randomUUID(),
            text: inputText,
            done: false,
            lastCompleted: '',
            note: '',
            // add subtask at the end of the list, but before any hidden or archived items
            sortOrder: subtasks.length,
            tabSortOrder: {},
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
            if (!addItem) throw new Error('Adding checklist items is not supported');
            await addItem(newChecklistItem);
            setInputText('');
            showToast('Task added successfully', 'success');
        } catch (error) {
            if (!isChoreAccessChangedError(error)) {
                showToast('Failed to add task. Please try again.', 'error');
            }
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
        if (!canDelete) return;

        const answer = confirm("Are you sure?");
        if (!answer) return;
        try {
            await deleteItem(id);
            showToast('Task deleted successfully', 'success');
        } catch (err) {
            console.error('Failed to delete task:', err);
            if (!isChoreAccessChangedError(err)) {
                showToast('Failed to delete task. Please try again.', 'error');
            }
        }
    }

    function handleOpenTaskForm() {
        if (!canAddSubtask) return;

        setOpenNewTaskForm(!openNewTaskForm);
        setShowNotes(false);
        toggleMenuOpen();
    }

    function toggleMenuOpen() {
        if (!isMenuOpen) {
            updateMenuPosition();
        } else {
            setIsMenuOpen(false);
        }
    }
    function handleClickOutsideMenu(event: MouseEvent | TouchEvent | FocusEvent) {
        // if target is buttonRef, do not close menu, since button's onClick will handle toggling
        const target = event.target as Node | null;
        if (target && buttonRef.current?.contains(target)) {
            return;
        }
        setIsMenuOpen(false);
    };
    useOnClickOutside(menuDropdownRef as React.RefObject<HTMLElement>, handleClickOutsideMenu)

    return (
        <div
            className={`sortable-item_drag-wrapper
                ${isOver ? 'sortable-item_drag-over' : ''}
                ${isMenuOpen ? 'sortable-item_drag-wrapper--menu-open' : ''}`}
            ref={setDragWrapperRef}
        >
            {animate && <div
                className={`sortable-item_container ${isPriority ? 'mode-priority' : ''}`}
            >
                <button
                    ref={setActivatorNodeRef}
                    {...attributes}
                    {...listeners}
                    className="sortable-item_drag-handle"
                    aria-label="Hold to move and reorder task"
                    title="Hold to move and reorder task"
                    type="button"
                    draggable={false}
                    onDragStart={(e) => e.preventDefault()}
                >
                    <GripVertical size={24} />
                </button>
                <div className="sortable-item_main-content">

                    <input
                        className="sortable-item_checkbox"
                        type="checkbox"
                        checked={checked}
                        onChange={delayCheck}
                        disabled={!canComplete}
                        aria-label={`Mark task "${text}" as done`}
                        aria-describedby={!canComplete ? accessDescriptionId : undefined}
                        title={!canComplete
                            ? 'Viewer access cannot change completion'
                            : checked ? "Mark as not done" : "Mark as done"}
                        onPointerDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                    />

                    <div className="sortable-item_text-container">
                        {checklistType === 'search-results' && (
                            <div
                                className="sortable-item_parent-breadcrumb"
                                aria-label={`Parent task: ${parentTask?.text ?? 'Unknown task'}`}
                            >
                                <span className="sortable-item_parent-label">Parent</span>
                                <ChevronRight size={12} aria-hidden="true" />
                                <span className="sortable-item_parent-name">
                                    {parentTask?.text ?? 'Unknown task'}
                                </span>
                                {(parentTask?.isArchived || isArchived) && (
                                    <span className="sortable-item_parent-status">Archived</span>
                                )}
                                {(parentTask?.isHidden || isHidden) && (
                                    <span className="sortable-item_parent-status">Not today</span>
                                )}
                            </div>
                        )}
                        <div className="sortable-item_text">
                            <h2 className="sortable-item_text-heading">
                                {isSubChore && checklistType !== 'search-results' && (
                                    <span className="sortable-item_subtask-indicator">Subtask: </span>
                                )}
                                {categoryDefinition ? (
                                    <span
                                        className="sortable-item_category-icon"
                                        title={categoryDefinition.name}
                                        aria-hidden="true"
                                    >
                                        <CategoryIcon iconKey={categoryDefinition.icon} size={16} color={categoryDefinition.color} />
                                    </span>
                                ) : null}
                                {text}
                            </h2>
                        </div>
                        <div className="sortable-item_metadata">
                            {accessRole && accessRole !== 'owner' && (
                                <span
                                    className="sortable-item_metadata-text sortable-item_sharing-status"
                                    title={`Shared with you as ${accessRole}`}
                                >
                                    <Users aria-hidden="true" size={12} />
                                    Shared with Me
                                </span>
                            )}
                            {accessRole === 'owner' && hasMembers && (
                                <span
                                    className="sortable-item_metadata-text sortable-item_sharing-status"
                                    title="Shared by me"
                                >
                                    <Users aria-hidden="true" size={12} />
                                    Shared by Me
                                </span>
                            )}
                            {(effectiveAccessRole === 'doer'
                                || effectiveAccessRole === 'viewer') && (
                                <span
                                    className="sortable-item_metadata-text sortable-item_access-status"
                                    id={accessDescriptionId}
                                >
                                    {effectiveAccessRole === 'doer'
                                        ? 'Completion only'
                                        : 'View only'}
                                </span>
                            )}
                            {(activeTab === TABS.today) && (
                                <span className="sortable-item_metadata-text sortable-item_recurrence-text">
                                    {mode === 'one-time' ?
                                        (<Calendar1 aria-hidden="true" size={12} />) :
                                        (<RefreshCw aria-hidden="true" size={12} />)
                                    }
                                    {getRecurrenceText(mode, recurrence)}
                                </span>
                            )}
                            {showLastCompleted && (
                                <span className="sortable-item_metadata-text">
                                    {lastCompletedDate}
                                </span>
                            )}
                            {(activeTab === TABS.upcoming && nextDue) || (isUpcomingSubtask && nextDue) ? (
                                <span className="sortable-item_metadata-text">
                                    {nextDueDate}
                                </span>
                            ) : null}
                        </div>
                    </div>
                </div>
                <div className="sortable-item_button-group-container">
                    {canEdit && (
                        <button
                            className="sortable-item_main-button sortable-item_priority-button"
                            onClick={() => prioritizeItem(id)}
                            aria-label={priorityBtnTitle}
                            title={priorityBtnTitle}
                            type="button"
                        >
                            {!isPriority ? (<Star size={24} />) : <Star fill="#ffff00" strokeWidth={0} size={24} />}
                        </button>
                    )}

                    {hasSubChores && (
                        <button
                            className="sortable-item_main-button sortable-item_hide-button"
                            onClick={toggleCollapsed}
                            aria-label={collapsed ? "Show subtasks" : "Collapse task"}
                            title={collapsed ? "Show subtasks" : "Collapse task"}
                            type="button"
                        >
                            {collapsed ? <ListChevronsDownUp size={24} /> : <ListChevronsUpDown size={24} />}
                            <span className="sortable-item_button-text-span">Subtasks</span>
                        </button>
                    )}

                    {!!note?.length && (
                        <button
                            className="sortable-item_main-button sortable-item_hide-button"
                            onClick={toggleNotes}
                            aria-label="Show notes"
                            title={showNotes ? "Hide notes" : "Show notes"}
                            type="button"
                        >
                            {showNotes ? <BookMinus size={24} /> : <BookPlus size={24} />}
                            <span className="sortable-item_button-text-span">Notes</span>
                        </button>
                    )}
                    {activeTab === TABS.archived || checklistType === 'template' ? null : (
                        <button
                            className="sortable-item_main-button sortable-item_hide-button"
                            onClick={delayHide}
                            aria-label="Hide task"
                            title={isHidden ? "Unhide task for today" : "Hide task for today"}
                            type="button"
                        >
                            {isHidden ? <CalendarPlus2 size={24} /> : <Ban size={24} />}
                            <span className="sortable-item_button-text-span">
                                {isHidden ? "Do Today" : "Skip"}
                            </span>
                        </button>
                    )}
                    {hasMenuActions && (
                    <div className="sortable-item_menu-wrapper">
                        <button
                            className={`sortable-item_main-button sortable-item_menu-button
                                    ${isMenuOpen ? 'sortable-item_menu-button--active' : ''}`}
                            aria-label="More task actions"
                            type="button"
                            ref={buttonRef}
                            onClick={toggleMenuOpen}
                        >
                            <MoreHorizontal size={24} />
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
                            {canAddSubtask && (
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
                            )}

                            {canEdit && !hasSubChores && (
                                <button
                                    className="sortable-item_hide-button"
                                    onClick={() => {
                                        setDropZoneOpen(!dropZoneOpen);
                                        setIsMenuOpen(false);
                                    }}
                                    aria-label={dropZoneOpen ? "Close subtask dropzone" : "Open subtask dropzone"}
                                >
                                    {dropZoneOpen ? <Minimize2 size={24} /> : <Expand size={24} />}
                                    <span className="sortable-item_button-text-span">
                                        {dropZoneOpen ? "Close Subtask Dropzone" : "Drag and Drop Tasks Here"}
                                    </span>
                                </button>
                            )}

                            {canEdit && (
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
                            )}

                            {!canEdit || checklistType === 'template' ? null : activeTab !== TAB_ARCHIVED ? (
                                <button
                                    className="sortable-item_archive-button"
                                    onClick={() => onMoveItem(id, false)}
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
                                    onClick={() => onMoveItem(id, true)}
                                    aria-label="Restore archived task"
                                    title="Restore archived task"
                                    type="button"
                                >
                                    <ListPlus size={24} />
                                    <span className="sortable-item_button-text-span">Restore</span>
                                </button>
                            )}

                            {canDelete && (
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
                            )}
                        </div>
                    </div>
                    )}
                </div>
                <AnimatePresence initial={false}>
                    {showNotes && (
                        <motion.div
                            key={`notes-${id}`}
                            className="sortable-item_note"
                            initial={{ height: 0, opacity: 0, y: -4 }}
                            animate={{ height: 'auto', opacity: 1, y: 0 }}
                            exit={{ height: 0, opacity: 0, y: -4 }}
                            transition={{ duration: 0.22, ease: 'easeOut' }}
                        >
                            {checklistType === 'search-results' ? (
                                <div
                                    className="sortable-item_note-preview"
                                    role="note"
                                    aria-label={`Note for ${text}`}
                                >
                                    {note}
                                </div>
                            ) : (
                                <NoteEditor
                                    ref={noteRef}
                                    initialMarkdown={note ?? ''}
                                    onChange={canEdit ? handleNoteChange : undefined}
                                    readOnly={!canEdit}
                                />
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
                {/* RECURSIVE SUBTASKS */}
                <div className={`sortable-item_subtasks-container ${collapsed ? 'sortable-item_subtasks-container--collapsed' : ''}`}>

                    <SortableContext items={filteredTasks?.map(i => i.id) || []}>
                        <AnimatePresence initial={false}>
                            {canEdit && !hasSubChores && dropZoneOpen && (
                                <motion.div
                                    key={`placeholder-${id}`}
                                    className="sortable-item_subtasks-motion-shell"
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.22, ease: 'easeOut' }}
                                >
                                    <SortableItemPlaceholder id={id as string} />
                                </motion.div>
                            )}

                            {!collapsed && hasSubChores && filteredTasks?.length === 0 && (
                                <motion.div
                                    key={`empty-subtasks-${id}`}
                                    className="sortable-item_subtasks-motion-shell"
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.22, ease: 'easeOut' }}
                                >
                                    <div className="sortable-item_no-subtasks">
                                        No subtasks to show. You have hidden or completed subtasks.<br />
                                        Adjust filters or go to "Not Today" tab to see all subtasks.
                                    </div>
                                </motion.div>
                            )}

                            {!collapsed && (filteredTasks?.length ?? 0) > 0 && (
                                <motion.div
                                    key={`subtasks-${id}`}
                                    className="sortable-item_subtasks-motion-shell"
                                    initial={{ height: 0, opacity: 0, y: -4 }}
                                    animate={{ height: 'auto', opacity: 1, y: 0 }}
                                    exit={{ height: 0, opacity: 0, y: -4 }}
                                    transition={{ duration: 0.22, ease: 'easeOut' }}
                                >
                                    {filteredTasks?.map((subtask) => (
                                        <SortableItem
                                            checklistType={checklistType}
                                            key={subtask.id}
                                            id={subtask.id}
                                            activeTab={activeTab}
                                            hasSubChores={subtask.hasSubChores}
                                            parentUuid={subtask.parentUuid}
                                            isArchived={subtask.isArchived}
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
                                            nextDue={subtask.nextDue}
                                            addItem={addItem}
                                            partialUpdateItem={partialUpdateItem}
                                            getSubtasks={getSubtasks}
                                            recurrence={subtask.recurrence}
                                            accessRole={subtask.accessRole}
                                            hasMembers={subtask.hasMembers}
                                            expandedNoteItemIds={expandedNoteItemIds}
                                            itemLookup={itemLookup}
                                        />
                                    ))}
                                </motion.div>
                            )}

                            {!collapsed && activeTab === TABS.today && upcomingTasks && upcomingTasks?.length > 0 && (
                                <motion.div
                                    key={`upcoming-subtasks-${id}`}
                                    className="sortable-item_upcoming-subtasks"
                                    initial={{ height: 0, opacity: 0, y: -4 }}
                                    animate={{ height: 'auto', opacity: 1, y: 0 }}
                                    exit={{ height: 0, opacity: 0, y: -4 }}
                                    transition={{ duration: 0.22, ease: 'easeOut' }}
                                >
                                    <IconButton
                                        icon={showUpcoming ? (<ListChevronsUpDown />) : (<ListChevronsDownUp />)}
                                        className="sortable-item_show-upcoming-button"
                                        aria-label={showUpcoming ? "Hide upcoming subtasks" : "Show upcoming subtasks"}
                                        label={showUpcoming ? "Hide upcoming subtasks" : "Show upcoming subtasks"}
                                        onClick={() => setShowUpcoming(!showUpcoming)}
                                        showLabel={true}
                                    />
                                    <AnimatePresence initial={false}>
                                        {showUpcoming && (
                                            <motion.div
                                                key={`upcoming-list-${id}`}
                                                className="sortable-item_subtasks-motion-shell"
                                                initial={{ height: 0, opacity: 0, y: -4 }}
                                                animate={{ height: 'auto', opacity: 1, y: 0 }}
                                                exit={{ height: 0, opacity: 0, y: -4 }}
                                                transition={{ duration: 0.22, ease: 'easeOut' }}
                                            >
                                                {upcomingTasks.map((subtask) => (
                                                    <SortableItem
                                                        checklistType={checklistType}
                                                        key={subtask.id}
                                                        id={subtask.id}
                                                        isArchived={subtask.isArchived}
                                                        activeTab={activeTab}
                                                        hasSubChores={subtask.hasSubChores}
                                                        parentUuid={subtask.parentUuid}
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
                                                        nextDue={subtask.nextDue}
                                                        isUpcomingSubtask={true}
                                                        addItem={addItem}
                                                        partialUpdateItem={partialUpdateItem}
                                                        getSubtasks={getSubtasks}
                                                        recurrence={subtask.recurrence}
                                                        accessRole={subtask.accessRole}
                                                        hasMembers={subtask.hasMembers}
                                                        expandedNoteItemIds={expandedNoteItemIds}
                                                        itemLookup={itemLookup}
                                                    />
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </SortableContext>

                </div>
                {canAddSubtask && openNewTaskForm ? (
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
            </div>}
        </div>
    );
};
