import { useState, useMemo, useRef, useEffect, type FC, type ReactElement, type SetStateAction } from 'react';
import type { ChecklistItem } from 'app/types';
import { DndContext, useSensors, useSensor, PointerSensor } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { SortableItem } from 'sortable-item/SortableItem';
import { MODES } from 'checklist/constants';
import CategorySelect from 'category-select/CategorySelect';
import { getModeColor } from 'src/checklist/utilities/get-mode-color';
import 'checklist/checklist.css';
import { useTask } from 'src/demo/use-demo-task';
import { useCalendarIntegration } from 'src/google-authorization/use-google-calendar';
import { ALL_CATEGORIES } from 'src/category-select/category-constants';
import CalendarEventItem from 'src/google-authorization/calendar-event-item';
import ScheduledTaskItem from 'src/google-authorization/scheduled-task-item';
import { default as Tabs } from 'src/checklist/tabs/Tabs';
import { TABS, type Tab } from 'src/checklist/tabs/types';
import EmptyStateFilters from 'src/checklist/empty-state/EmptyStateFilters';
import GoogleLoginButton from 'src/authentication/google-login-button';
import { useAuthentication } from 'src/authentication/use-authentication';
import { useLocation } from "wouter";
import { ROUTES } from 'src/router';
import { type Mode } from 'app/types';
import { filterTasks } from 'src/app/utilities/filter-tasks';
import { Filter } from 'lucide-react';

interface ChecklistProps {
    onEditItem: (item: ChecklistItem) => void;
    sparkles: ReactElement;
}

const DemoChecklist: FC<ChecklistProps> = ({
    onEditItem,
    sparkles
}) => {
    const {
        items,
        deleteItem,
        toggleItem,
        prioritizeItem,
        archiveItem,
        reorderItems,
        getSubtasks,
        reset,
        hideForToday,
        unhideForToday,
    } = useTask();
    const { events, tasks, markScheduledTaskCompletion } = useCalendarIntegration();
    const [hideCompleted, setHideCompleted] = useState(true);
    const [activeFilters, setActiveFilters] = useState<Mode[]>([]);
    const [filterCategory, setFilterCategory] = useState<string>(ALL_CATEGORIES);
    const [showSparkles, setShowSparkles] = useState(false);
    const [activeTab, setActiveTab] = useState(TABS.today);
    const sparkleTimeoutRef = useRef<number | null>(null);
    const isActiveList = activeTab === TABS.today;
    const { login, googleButtonState } = useAuthentication();
    const [_location, setLocation] = useLocation();
    const [showFilters, setShowFilters] = useState(false);

    const hasExclusiveFilter = activeFilters.some(f =>
        MODES.includes(f as (typeof MODES)[number])
    );

    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            if (activeTab === TABS.hidden && task.isHidden) return true;
            if (activeTab === TABS.scheduled && !task.isHidden) return true;
            if (activeTab === TABS.today && !task.isHidden) return true;
            return false;

        });
    }, [tasks, activeTab]);

    const filteredItems = useMemo(() => {
        return filterTasks({ items, activeFilters, activeTab, hideCompleted, filterCategory })
            .sort((a, b) => {
                if (activeTab === TABS.priority || activeTab === TABS.hidden || activeTab === TABS.archived) {
                    return (a.tabSortOrder?.[activeTab] ?? 0) - (b.tabSortOrder?.[activeTab] ?? 0);
                }
                return a.sortOrder - b.sortOrder;
            });
    }, [items, activeFilters, activeTab, hideCompleted, filterCategory]);

    const allItems = [...events, ...filteredTasks, ...filteredItems];

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

        reorderItems(active.id as string, over.id as string);
    };

    const toggleChecked = (id: string, checked: boolean) => {
        toggleItem(id, checked);
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

    const handleHide = (id: string, isHiddenItem: boolean) => {
        if (isHiddenItem) {
            unhideForToday(id as string);
        } else {
            hideForToday(id as string);
        }
    };

    const handleMoveItem = (id: string) => {
        archiveItem(id);
    };

    const handleTabChange = (tab: SetStateAction<Tab>) => {
        setActiveTab(tab);
    }

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

    function clearFilters() {
        setActiveFilters([]);
        setFilterCategory(ALL_CATEGORIES);
        setHideCompleted(false);
    }

    const handleLoginSuccess = async (token: string) => {
        try {
            await login(token);
            setLocation(ROUTES.home);
        }
        catch (err) { console.error(err); }
    };

    useEffect(() => {
        return () => {
            if (sparkleTimeoutRef.current) {
                clearTimeout(sparkleTimeoutRef.current);
                sparkleTimeoutRef.current = null;
            }
        };
    }, []);

    return (
        <>
            {googleButtonState !== 'pending' ? (<>
                {showSparkles && sparkles}
                <div className="checklist_toolbar">
                                    <div className="checklist_filter-container">
                    <button
                        className="filter-toggle-icon-button"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <Filter size={24} />Filters
                    </button>
                    {showFilters && (
                        <>
                            <button
                                onClick={() => {
                                    const updatedFilters = activeFilters.filter(
                                        (filter) => !MODES.includes(filter)
                                    );
                                    setActiveFilters(updatedFilters);
                                }}
                                className={`filter-button ${!hasExclusiveFilter
                                    ? 'filter-button-all-active'
                                    : 'filter-button-all'
                                    }`}
                            >
                                All
                            </button>
                            {MODES.map(mode => {
                                const isActive = activeFilters.includes(mode);
                                return (
                                    <button
                                        key={mode}
                                        onClick={() => {
                                            const nextFilters = activeFilters.includes(mode)
                                                ? activeFilters.filter(t => t !== mode)
                                                : [...activeFilters, mode];

                                            setActiveFilters(nextFilters);
                                        }}
                                        className={`
                                        filter-button
                                        ${isActive ? getModeColor(mode) + 'filter-button-active' : ''}
                                    `}
                                    >
                                        {mode}
                                    </button>
                                )
                            })}
                            <div className="checklist_hide-completed-checkbox-container">
                                <input
                                    className="checklist_hide-completed-checkbox-input"
                                    type="checkbox"
                                    id="hideCompleted"
                                    checked={hideCompleted}
                                    onChange={(e) => setHideCompleted(e.target.checked)}
                                />
                                <label
                                    htmlFor="hideCompleted"
                                    className="checklist_hide-completed-checkbox-label"
                                >
                                    Hide Completed
                                </label>
                            </div>
                            <CategorySelect
                                id="checklist-filter-category-select"
                                isFilter={true}
                                selectedCategory={filterCategory}
                                onChange={(value: string) => setFilterCategory(value)}
                            />
                        </>
                    )}
                </div>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                />
            </div>
            <DndContext onDragEnd={handleDragEnd} onDragStart={handleDragStart} sensors={sensors}>
                <div className="checklist_list-container">
                    <SortableContext items={allItems.map(i => i.id)}>
                        {!allItems.length && (
                            <EmptyStateFilters
                                activeFilters={activeFilters}
                                onClearFilters={clearFilters}
                                filterCategory={filterCategory}
                                hideCompleted={hideCompleted}

                            />
                        )}
                        {events.map(event => (
                            <CalendarEventItem
                                key={event.id}
                                event={event}
                            />
                        ))}
                        {filteredTasks?.map(task => (
                            <ScheduledTaskItem
                                key={task.id}
                                task={task}
                                markCompleted={markScheduledTaskCompletion}
                                hideForToday={hideForToday}
                                unhideForToday={unhideForToday}
                            />
                        ))}
                        {filteredItems.map(item => (
                            <SortableItem
                                activeTab={activeTab}
                                hasSubChores={item.hasSubChores}
                                isActive={isActiveList}
                                checked={item.done}
                                key={item.id}
                                id={item.id}
                                isHidden={item.isHidden}
                                isHideCompleted={hideCompleted}
                                text={item.text}
                                note={item.note}
                                lastCompleted={item.lastCompleted}
                                deleteItem={deleteItem}
                                prioritizeItem={prioritizeItem}
                                toggleChecked={toggleChecked}
                                handleEdit={handleEdit}
                                handleHideItem={handleHide}
                                subtasks={getSubtasks(item.id)}
                                onMoveItem={handleMoveItem}
                                isPriority={item.isPriority}
                                onSuccess={displaySparkles}
                            />
                        ))}
                    </SortableContext>

                    </div>
                </DndContext>
            </>) : null}
            <div className="demo-actions">

                <div className="google-login-shell">
                    {googleButtonState === 'pending' ? (
                        <div className="google-login-fallback">
                            Loading sign in…
                        </div>
                    ) : googleButtonState === 'success' ? (<>
                        <p className="demo-keep-copy">
                            Want to keep this space?
                        </p>
                    </>) : null}
                    <GoogleLoginButton onSuccess={handleLoginSuccess} />
                </div>


                <button className="demo-reset" onClick={reset}>
                    Restore demo tasks
                </button>
            </div>
        </>
    )
}

export default DemoChecklist;
