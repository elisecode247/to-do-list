import { useState, useRef, useEffect, type FC, type ReactElement } from 'react';
import type { ChecklistItem, Mode } from 'app/types';
import { DndContext, useSensors, useSensor, PointerSensor } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { SortableItem } from 'sortable-item/SortableItem';
import { ONE_TIME_MODE } from 'checklist/constants';
import 'checklist/checklist.css';
import { useTask } from 'src/app/use-task';
import CalendarEventItem from 'src/google-authorization/calendar-event-item';
import CalendarTaskItem from 'src/google-authorization/calendar-task-item';
import { TABS, type Tab } from 'src/app-toolbar/tabs/types';
import EmptyStateFilters from 'src/checklist/empty-state/EmptyStateFilters';
import { filterTasks } from 'src/app/utilities/filter-tasks';
import { useToast } from 'src/toast/use-toast';
import { ALL_MODES } from 'src/checklist/constants';
import type { GoogleEvent, GoogleTask } from 'src/google-authorization/types';
import NoteEditor from 'src/editor/NoteEditor';
import { type MDXEditorMethods } from '@mdxeditor/editor';
import { useDebounceValue } from 'usehooks-ts';
import { API_URL } from 'src/app/constants';
import { authHeaders } from 'src/authentication/authentication-api';
import { useGoogleCalendar } from 'src/google-authorization/use-google-calendar';

function isTodayOrBefore(date: Date) {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // end of today
    return date <= today;
}

function isTomorrowOrLater(date: Date) {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // end of today
    return date > today;
}

interface ChecklistProps {
    activeTab: Tab;
    modeFilter: Mode | typeof ALL_MODES;
    hideCompleted: boolean;
    filterCategory: string;
    clearFilters: () => void;
    onEditItem: (item: ChecklistItem) => void;
    sparkles: ReactElement;
    initialNotes: string;
    onNotesChange?: (notes: string) => void;
}

const Checklist: FC<ChecklistProps> = ({
    activeTab,
    modeFilter,
    hideCompleted,
    filterCategory,
    clearFilters,
    onEditItem,
    sparkles,
    initialNotes,
    onNotesChange,
}) => {
    const {
        items,
        deleteItem,
        toggleItem,
        prioritizeItem,
        archiveItem,
        sortItems,
        getSubtasks,
        hideForToday,
        unhideForToday,
    } = useTask();
    const {
        events,
        tasks,
        markCalendarTaskCompletion,
        hideEventForToday,
        unhideEventForToday,
    } = useGoogleCalendar();

    const [showSparkles, setShowSparkles] = useState(false);
    const sparkleTimeoutRef = useRef<number | null>(null);
    const isActiveList = activeTab === TABS.today;
    const { showToast } = useToast();
    const completedDayRef = useRef(false);
    const [showNoteSaved, setShowNoteSaved] = useState(false);
    const noteRef = useRef<MDXEditorMethods>(null);
    const [debouncedNotes, setDebouncedNotes] = useDebounceValue('', 1000);

    useEffect(() => {
        const saveAppNotes = async (notes: string) => {
            try {
                const response = await fetch(`${API_URL}/user-checklist`, {
                    method: "PUT",
                    headers: await authHeaders(),
                    body: JSON.stringify({ notes }),
                });

                if (!response.ok) {
                    const text = await response.text();
                    console.error(`Failed to save app notes: ${response.status} - ${text}`);
                    showToast('Failed to save app notes.', 'error');
                    setShowNoteSaved(false);
                } else {
                    setShowNoteSaved(true);
                    console.info("App notes saved successfully");
                    setTimeout(() => setShowNoteSaved(false), 2000);
                }
            } catch (err) {
                console.error("Failed to save app notes:", err);
                showToast('Failed to save app notes.', 'error');
                setShowNoteSaved(false);
            }
        };

        if (debouncedNotes) {
            saveAppNotes(debouncedNotes);
        }
    }, [debouncedNotes, showToast]);

    function handleNotesChange(markdown: string) {
        setDebouncedNotes(markdown);
        onNotesChange?.(markdown);
    }

    const filteredTasks = tasks.map(task => ({ ...task })).filter(task => {
        if (activeTab === TABS.hidden && task.isHidden) return true;
        if (activeTab === TABS.upcoming && !task.isHidden) return true;
        if (activeTab === TABS.today && !task.isHidden) return true;
        return false;
    });

    const filteredItems = filterTasks({ items, modeFilter, activeTab, hideCompleted, filterCategory })
        .sort((a, b) => {
            if (activeTab === TABS.priority || activeTab === TABS.hidden || activeTab === TABS.archived) {
                return (a.tabSortOrder?.[activeTab] ?? 0) - (b.tabSortOrder?.[activeTab] ?? 0);
            } else if (activeTab === TABS.upcoming) {
                const aDue = a.nextDue ? new Date(a.nextDue).getTime() : Infinity;
                const bDue = b.nextDue ? new Date(b.nextDue).getTime() : Infinity;
                return aDue - bDue;
            }
            return a.sortOrder - b.sortOrder;
        });

    const filteredEvents = events.filter(event => {
        if (activeTab === TABS.hidden && event.isHidden) return true;
        if (activeTab === TABS.upcoming && !event.isHidden) return true;
        if (activeTab === TABS.today && !event.isHidden) {
            return isTodayOrBefore(event.startDate);
        } else if (activeTab === TABS.upcoming) {
            return isTomorrowOrLater(event.startDate);
        }
        return false;
    }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    const getItemDate = (item: ChecklistItem | GoogleEvent | GoogleTask) => {
        if ('startDate' in item) {
            return new Date(item.startDate).getTime();
        }
        if ('due' in item) {
            return item.due ? new Date(item.due).getTime() : Infinity;
        }
        return item.nextDue ? new Date(item.nextDue).getTime() : Infinity;
    };

    const allItems = [...filteredEvents, ...filteredTasks, ...filteredItems].sort((a, b) => {
        if (activeTab === TABS.upcoming) {
            const aDate = getItemDate(a as ChecklistItem | GoogleEvent | GoogleTask);
            const bDate = getItemDate(b as ChecklistItem | GoogleEvent | GoogleTask);
            return aDate - bDate;
        }

        return 1;
    });
    const completedDay = items.some(item => item.done) &&
        filteredItems.length === 0 && activeTab === TABS.today;

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
                delay: 100,
            },
        })
    );
    function handleDragStart(event: DragStartEvent) {
        const active = items.find(t => t.id === event.active.id) || items.find(i => i.id === event.active.id);
        if (!active) return;
    }
    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        sortItems(filteredItems, activeTab, active.id as string, over.id as string);
    };

    const toggleChecked = async (id: string, checked: boolean) => {
        const selectedItem = items.find(item => item.id === id);
        if (!checked) {
            const confirmed = confirm('If you uncheck, you will lose ' +
                'the last completed date. Are you sure?'
            );
            if (!confirmed) return;
        }
        try {
            await toggleItem(id, checked);
            // archive if item's mode is ONE_TIME_MODE and is being marked completed
            if (selectedItem?.mode === ONE_TIME_MODE && checked) {
                await archiveItem(id);
                showToast('Task archived successfully', 'success');
            }
        } catch (err) {
            console.error('Failed to toggle task:', err);
            showToast('Failed to update task status. Please try again.', 'error');
        }
    };


    const handleEdit = (id: string) => {
        const selectedItem = items.find(item => item.id === id);
        if (!selectedItem) return;

        const formattedItem = {
            ...selectedItem,
            lastCompleted: selectedItem.lastCompleted
                ? new Date(selectedItem.lastCompleted).toISOString()
                : ''
        };

        onEditItem(formattedItem);
    };

    const handleHide = async (id: string, isHiddenItem: boolean) => {
        try {
            if (isHiddenItem) {
                await unhideForToday(id as string);
            } else {
                await hideForToday(id as string);
            }
        } catch (err) {
            console.error('Failed to update task visibility:', err);
            showToast('Failed to update task visibility. Please try again.', 'error');
        }
    };

    const handleEventHide = async (id: string, isHiddenItem: boolean) => {
        try {
            if (isHiddenItem) {
                await unhideEventForToday(id as string);
            } else {
                await hideEventForToday(id as string);
            }
        } catch (err) {
            console.error('Failed to update event visibility:', err);
            showToast('Failed to update event visibility. Please try again.', 'error');
        }
    };

    const handleMoveItem = async (id: string) => {
        try {
            await archiveItem(id);
            showToast('Task archived successfully', 'success');
        } catch (err) {
            console.error('Failed to archive task:', err);
            showToast('Failed to archive task. Please try again.', 'error');
        }
    };



    const displaySparkles = () => {
        setShowSparkles(true);
        if (sparkleTimeoutRef.current) {
            clearTimeout(sparkleTimeoutRef.current);
        }

        sparkleTimeoutRef.current = window.setTimeout(() => {
            setShowSparkles(false);
            sparkleTimeoutRef.current = null;
        }, 3000)
    }

    useEffect(() => {
        return () => {
            if (sparkleTimeoutRef.current) {
                clearTimeout(sparkleTimeoutRef.current);
                sparkleTimeoutRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!completedDayRef.current && completedDay && activeTab === TABS.today) {
            setTimeout(() => {
                displaySparkles()
                completedDayRef.current = !!completedDay;
            }, 0);
        }
    }, [completedDay, activeTab]);

    return (
        <>
            {showSparkles && sparkles}
            <DndContext onDragEnd={handleDragEnd} onDragStart={handleDragStart} sensors={sensors}>
                <div className="checklist_list-container">
                    <SortableContext items={allItems.map(i => i.id)}>
                        <div className="sortable-item-container" style={{ position: 'relative' }}>
                            <NoteEditor
                                className="app_note-editor"
                                initialMarkdown={initialNotes || "Write notes here"}
                                readOnly={false}
                                ref={noteRef}
                                onChange={handleNotesChange}
                            />
                            {showNoteSaved && <div className="note-saved-indicator">Notes saved</div>}
                        </div>
                        {!allItems.length && (
                            <EmptyStateFilters
                                modeFilter={modeFilter}
                                onClearFilters={clearFilters}
                                filterCategory={filterCategory}
                                hideCompleted={hideCompleted}
                                type={completedDay ? 'completedDay' : 'noTasks'}
                            />
                        )}
                        {(allItems as (ChecklistItem | GoogleEvent | GoogleTask)[]).map((item) => {
                            if ((item as GoogleEvent).itemType === 'google-event') {
                                const eventItem = item as GoogleEvent;
                                return (<CalendarEventItem
                                    key={eventItem.id}
                                    event={eventItem}
                                    onHideItem={handleEventHide}
                                />);
                            } else if (item.itemType === 'google-task') {
                                const taskItem = item as GoogleTask;
                                return (<CalendarTaskItem
                                    key={taskItem.id}
                                    task={taskItem}
                                    markCompleted={markCalendarTaskCompletion}
                                />);
                            } else if (item.itemType === 'checklist-item') {
                                const checklistItem = item as ChecklistItem;
                                return (
                                    <SortableItem
                                        activeTab={activeTab}
                                        hasSubChores={checklistItem.hasSubChores}
                                        isSubChore={!!checklistItem.parentUuid}
                                        isActive={isActiveList}
                                        isPriority={checklistItem.isPriority}
                                        checked={checklistItem.done}
                                        key={checklistItem.id}
                                        id={checklistItem.id}
                                        isHidden={checklistItem.isHidden}
                                        isHideCompleted={hideCompleted}
                                        text={checklistItem.text}
                                        note={checklistItem.note}
                                        mode={checklistItem.mode}
                                        category={checklistItem.category}
                                        lastCompleted={checklistItem.lastCompleted}
                                        deleteItem={deleteItem}
                                        prioritizeItem={prioritizeItem}
                                        toggleChecked={toggleChecked}
                                        handleEdit={handleEdit}
                                        handleHideItem={handleHide}
                                        subtasks={getSubtasks(checklistItem.id)}
                                        onMoveItem={handleMoveItem}
                                        onSuccess={displaySparkles}
                                        nextDue={checklistItem.nextDue}
                                    />
                                );
                            }
                            return null;
                        })}
                        {/* Placeholder div to ensure proper spacing at the end of the list */}
                        <div style={{ height: '250px', flexShrink: 0 }} />
                    </SortableContext>
                </div>
            </DndContext>
        </>
    )
}

export default Checklist;
