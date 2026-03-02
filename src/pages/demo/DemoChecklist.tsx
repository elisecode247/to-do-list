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
import { useTask } from 'src/pages/demo/use-demo-task';
import { useCalendarIntegration } from 'src/google-authorization/use-google-calendar';
import { ALL_CATEGORIES } from 'src/category-select/category-constants';
import CalendarEventItem from 'src/google-authorization/calendar-event-item';
import CalendarTaskItem from 'src/google-authorization/calendar-task-item';
import { default as Tabs } from 'src/app-toolbar/tabs/Tabs';
import { TABS, type Tab } from 'src/app-toolbar/tabs/types';
import EmptyStateFilters from 'src/checklist/empty-state/EmptyStateFilters';
import GoogleLoginButton from 'src/authentication/google-login-button';
import { useAuthentication } from 'src/authentication/use-authentication';
import { useLocation } from "wouter";
import { ROUTES } from 'src/router';
import { type Mode } from 'app/types';
import { filterTasks } from 'src/app/utilities/filter-tasks';
import { Filter } from 'lucide-react';
import { ALL_MODES } from 'src/checklist/constants';
import type { GoogleTask } from 'src/google-authorization/types';

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
        sortItems,
        getSubtasks,
        reset,
        hideForToday,
        unhideForToday,
    } = useTask();
    const { events, tasks, markCalendarTaskCompletion } = useCalendarIntegration();
    const [hideCompleted, setHideCompleted] = useState(true);
    const [modeFilter, setModeFilter] = useState<Mode | typeof ALL_MODES>(ALL_MODES);
    const [filterCategory, setFilterCategory] = useState<string>(ALL_CATEGORIES);
    const [showSparkles, setShowSparkles] = useState(false);
    const [activeTab, setActiveTab] = useState(TABS.today);
    const sparkleTimeoutRef = useRef<number | null>(null);
    const isActiveList = activeTab === TABS.today;
    const { login, googleButtonState } = useAuthentication();
    const [, setLocation] = useLocation();
    const [showFilters, setShowFilters] = useState(false);

    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            if (activeTab === TABS.hidden && task.isHidden) return true;
            if (activeTab === TABS.upcoming && !task.isHidden) return true;
            if (activeTab === TABS.today && !task.isHidden) return true;
            return false;

        });
    }, [tasks, activeTab]);

    const filteredItems = useMemo(() => {
        return filterTasks({ items, modeFilter, activeTab, hideCompleted, filterCategory })
            .sort((a, b) => {
                if (activeTab === TABS.priority || activeTab === TABS.hidden || activeTab === TABS.archived) {
                    return (a.tabSortOrder?.[activeTab] ?? 0) - (b.tabSortOrder?.[activeTab] ?? 0);
                }
                return a.sortOrder - b.sortOrder;
            });
    }, [items, modeFilter, activeTab, hideCompleted, filterCategory]);

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

        sortItems(active.id as string, over.id as string);
    };

    const toggleChecked = (id: string, checked: boolean) => {
        if (!checked) {
            const confirmed = confirm('If you uncheck, you will lose ' +
                'the last completed date. Are you sure?'
            );
            if (!confirmed) return;
        }
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
        setModeFilter(ALL_MODES);
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
                                    setModeFilter(ALL_MODES);
                                }}
                                className={`filter-button ${modeFilter === ALL_MODES
                                    ? 'filter-button-all-active'
                                    : 'filter-button-all'
                                    }`}
                            >
                                All
                            </button>
                            {MODES.map(mode => {
                                const isActive = modeFilter.includes(mode);
                                return (
                                    <button
                                        key={mode}
                                        onClick={() => {
                                            setModeFilter(mode);
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
                                modeFilter={modeFilter}
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
                            <CalendarTaskItem
                                key={task.id}
                                task={task as GoogleTask}
                                markCompleted={markCalendarTaskCompletion}
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
                                mode={item.mode}
                                category={item.category}
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
