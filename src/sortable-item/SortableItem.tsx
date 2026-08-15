import { useSortable } from '@dnd-kit/sortable';
import { useCallback, useEffect, useRef } from 'react';
import type { FC, Dispatch, SetStateAction } from 'react';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import 'sortable-item/sortable-item.css';
import { CSS } from '@dnd-kit/utilities';
import { getDaysAgo, getDaysFromNow } from 'src/utilities/days-ago';
import type { ChecklistItem, ChoreAccessRole, Mode } from 'src/app/types';
import { useToast } from 'src/toast/use-toast';
import {
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
    SkipForward,
    ListChevronsDownUp,
    ListChevronsUpDown,
    RefreshCw,
    ChevronRight,
    Users,
} from 'lucide-react';
import { Checkbox } from '@headlessui/react';
import { SortableContext } from '@dnd-kit/sortable';
import SortableItemPlaceholder from './SortableItemPlaceholder';
import { TAB_ARCHIVED, TAB_TODAY, TAB_UPCOMING } from 'src/app-toolbar/tabs/types';
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
    isTopLevel?: boolean;
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
    ownerName?: string | null;
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
    isTopLevel = true,
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
    ownerName,
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
    const [menuPosition, setMenuPosition] = useState<React.CSSProperties>({});
    const [isExiting, setIsExiting] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const exitTimerRef = useRef<number | null>(null);
    const [showUpcoming, setShowUpcoming] = useState(false);
    const dragWrapperRef = useRef<HTMLDivElement>(null);
    const menuDropdownRef = useRef<HTMLDivElement>(null);
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
        if (activeTab === TAB_TODAY && t.upcoming) {
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

    const updateMenuPosition = useCallback(() => {
        if (!buttonRef.current) return;

        const buttonRect = buttonRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const viewportGutter = 8;
        const menuGap = 4;
        const dropdownHeight = menuDropdownRef.current?.offsetHeight || 260;
        const horizontalPosition = buttonRect.left < viewportWidth / 2
            ? { left: Math.max(buttonRect.left, viewportGutter) }
            : {
                right: Math.max(
                    viewportWidth - buttonRect.right,
                    viewportGutter,
                ),
            };

        if (viewportHeight - buttonRect.bottom < dropdownHeight) {
            setMenuPosition({
                ...horizontalPosition,
                bottom: Math.max(
                    viewportGutter,
                    viewportHeight - buttonRect.top + menuGap,
                ),
            });
        } else {
            setMenuPosition({
                ...horizontalPosition,
                top: buttonRect.bottom + menuGap,
            });
        }
    }, []);

    const scheduleExitAnimation = useCallback((callback: () => void, delay = 220) => {
        setIsExiting(true);
        exitTimerRef.current = window.setTimeout(() => {
            exitTimerRef.current = null;
            setIsExiting(false);
            callback();
        }, delay);
    }, []);

    async function delayHide() {
        scheduleExitAnimation(() => {
            handleHideItem(id, isHidden);
        }, 334);
    }

    function handleCheck(checked: boolean) {
        if (checked && isHideCompleted) {
            scheduleExitAnimation(() => {
                toggleChecked(id, checked);
            }, 334);
        } else {
            toggleChecked(id, checked);
        }
        if (checked && isPriority) onSuccess(true);
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
            setIsMenuOpen(true);
        } else {
            setIsMenuOpen(false);
        }
    }
    function handleClickOutsideMenu(event: MouseEvent | TouchEvent | FocusEvent) {
        const target = event.target;
        if (!(target instanceof Node)) {
            setIsMenuOpen(false);
            return;
        }

        // Ignore clicks within the same task row so sibling controls can finish
        // their own click handling without the menu tearing down first.
        if (buttonRef.current?.contains(target) || dragWrapperRef.current?.contains(target)) {
            return;
        }

        setIsMenuOpen(false);
    }
    useOnClickOutside(menuDropdownRef as React.RefObject<HTMLElement>, handleClickOutsideMenu)

    useEffect(() => {
        if (!isMenuOpen) return;

        const handleViewportChange = () => {
            const button = buttonRef.current;
            if (!button) {
                setIsMenuOpen(false);
                return;
            }

            const buttonRect = button.getBoundingClientRect();
            const isOutsideViewport = (
                buttonRect.bottom <= 0
                || buttonRect.top >= window.innerHeight
                || buttonRect.right <= 0
                || buttonRect.left >= window.innerWidth
            );

            if (isOutsideViewport) {
                setIsMenuOpen(false);
                return;
            }

            updateMenuPosition();
        };

        window.addEventListener('resize', handleViewportChange);
        window.addEventListener('scroll', handleViewportChange, true);
        return () => {
            window.removeEventListener('resize', handleViewportChange);
            window.removeEventListener('scroll', handleViewportChange, true);
        };
    }, [isMenuOpen, updateMenuPosition]);

    return (
        <div
            className={`sortable-item_drag-wrapper
                ${isOver ? 'sortable-item_drag-over' : ''}
                ${isMenuOpen ? 'sortable-item_drag-wrapper--menu-open' : ''}`}
            ref={setDragWrapperRef}
        >
            <motion.div
                className={`sortable-item_container
                    ${isPriority ? 'mode-priority' : ''}
                    ${isSubChore && !isTopLevel ? 'sortable-item_container--subchore' : ''}
                `}
                initial={{
                    opacity: 0,
                    scale: 0.95,
                    filter: "blur(2px)",
                }}
                animate={
                    isExiting
                        ? {
                            opacity: [1, 0.3, 0],
                            scale: [1, 0.5, 0],
                            filter: "blur(2px)",
                        }
                        : {
                            opacity: 1,
                            scale: 1,
                            filter: "blur(0px)",
                        }
                }
                transition={{ duration: 0.32 }}
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
                <label
                    className={`sortable-item_checkbox-container ${!canComplete ? 'sortable-item_checkbox-container--disabled' : ''}`}
                    onPointerDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                >
                    <Checkbox
                        className={`sortable-item_checkbox ${!canComplete ? 'sortable-item_checkbox--disabled' : ''}`}
                        checked={checked}
                        onChange={handleCheck}
                        disabled={!canComplete}
                        aria-label={`Mark task "${text}" as done`}
                        aria-describedby={!canComplete ? accessDescriptionId : undefined}
                        title={!canComplete
                            ? 'Viewer access cannot change completion'
                            : checked ? "Mark as not done" : "Mark as done"}
                        onPointerDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                    >
                        <svg
                            className="sortable-item_checkbox-icon"
                            viewBox="0 0 14 14"
                            fill="none"
                            aria-hidden="true"
                        >
                            <path
                                d="M3 8L6 11L11 3.5"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </Checkbox>
                </label>
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
                        {isPriority && (
                            <span
                                className="sortable-item_metadata-text sortable-item_priority-status"
                                title="Priority task"
                            >
                                <Star aria-hidden="true" size={12} fill="currentColor" />
                                Priority
                            </span>
                        )}
                        {accessRole && accessRole !== 'owner' && (
                            <span
                                className="sortable-item_metadata-text sortable-item_sharing-status"
                                title={ownerName
                                    ? `Shared by ${ownerName} with ${accessRole} access`
                                    : `Shared with you as ${accessRole}`}
                            >
                                <Users aria-hidden="true" size={12} />
                                {ownerName ? `Shared by ${ownerName}` : 'Shared with Me'}
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
                        {(activeTab === TAB_TODAY) && (
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
                        {(activeTab === TAB_UPCOMING && nextDue) || (isUpcomingSubtask && nextDue) ? (
                            <span className="sortable-item_metadata-text">
                                {nextDueDate}
                            </span>
                        ) : null}
                    </div>
                </div>
                <div className="sortable-item_button-group-container">
                    {canEdit && (
                        <IconButton
                            className="sortable-item_main-button sortable-item_priority-button"
                            onClick={() => prioritizeItem(id)}
                            aria-label={priorityBtnTitle}
                            title={priorityBtnTitle}
                            icon={!isPriority ? (<Star size={24} />) : <Star fill="#ffff00" strokeWidth={0} size={24} />}
                            label="Priority"
                            showLabel={true}
                        />
                    )}
                    {activeTab === TAB_ARCHIVED || checklistType === 'template' ? null : (
                        <IconButton
                            className="sortable-item_main-button sortable-item_hide-button"
                            onClick={delayHide}
                            aria-label={isHidden ? "Do task today" : "Skip task today"}
                            title={isHidden ? "Do task today" : "Skip task today"}
                            icon={isHidden ? <CalendarPlus2 size={24} /> : <SkipForward size={24} />}
                            label={isHidden ? "Do Today" : "Skip Today"}
                        />
                    )}
                    {hasSubChores && (
                        <IconButton
                            className="sortable-item_main-button sortable-item_hide-button"
                            onClick={toggleCollapsed}
                            aria-label={collapsed ? "Show subtasks" : "Collapse task"}
                            title={collapsed ? "Show subtasks" : "Collapse task"}
                            icon={collapsed ? <ListChevronsDownUp size={24} /> : <ListChevronsUpDown size={24} />}
                            label="Subtasks"
                        />
                    )}

                    {!!note?.length && (
                        <IconButton
                            className="sortable-item_main-button sortable-item_hide-button"
                            onClick={toggleNotes}
                            aria-label="Show notes"
                            title={showNotes ? "Hide notes" : "Show notes"}
                            label="Notes"
                            icon={showNotes ? <BookMinus size={24} /> : <BookPlus size={24} />}
                        />
                    )}
                    {hasMenuActions && (
                        <div className="sortable-item_menu-wrapper">
                            <IconButton
                                className={`sortable-item_main-button sortable-item_menu-button
                                ${isMenuOpen ? 'sortable-item_menu-button--active' : ''}`}
                                aria-label="More task actions"
                                ref={buttonRef}
                                onClick={toggleMenuOpen}
                                showLabel={true}
                                icon={<MoreHorizontal size={24} />}
                                label="Actions"
                            />

                            {isMenuOpen && typeof document !== 'undefined' && createPortal(
                                <div
                                    ref={menuDropdownRef}
                                    className={`sortable-item_menu-dropdown
                            ${isMenuOpen ? 'sortable-item_menu-dropdown--open' : ''}`}
                                    style={menuPosition}
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
                                , document.body)}
                        </div>
                    )}
                </div>
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
                                            isSubChore={!!subtask.parentUuid}
                                            isTopLevel={false}
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
                                            ownerName={subtask.ownerName}
                                            hasMembers={subtask.hasMembers}
                                            expandedNoteItemIds={expandedNoteItemIds}
                                            itemLookup={itemLookup}
                                        />
                                    ))}
                                </motion.div>
                            )}

                            {!collapsed && activeTab === TAB_TODAY && upcomingTasks && upcomingTasks?.length > 0 && (
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
                                                        isSubChore={!!subtask.parentUuid}
                                                        isTopLevel={false}
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
                                                        ownerName={subtask.ownerName}
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
            </motion.div>
        </div>
    );
};
