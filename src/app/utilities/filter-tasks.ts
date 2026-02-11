import type { ChecklistItem, FilterParams } from 'app/types';
import { isCategoryIncluded } from 'src/category-select/category-constants';
import { TABS } from 'src/checklist/tabs/types';

export function filterTasks({
    items,
    activeTab,
    activeFilters,
    hideCompleted,
    filterCategory,
    isHiddenToday,
}: FilterParams): ChecklistItem[] {
    if (!items.length) return [];
    console.log("%c Line:13 🥟 items", "color:#93c0a4", items);

    // Add isHidden property to each task
    let filteredItems = items.map(task => ({
        ...task,
        isHidden: isHiddenToday(task.id),
    }))

        console.log("%c Line:17 🍤 filteredItems", "color:#f5ce50", filteredItems);

    // --- Tab filtering ---
    filteredItems = filteredItems.filter(task => matchTab(task, activeTab))
    console.log("%c Line:25 🍫 filteredItems", "color:#42b983", filteredItems);

    // --- Mode & other filters ---
    filteredItems = filteredItems.filter(task =>
        matchFilters(task, { activeFilters, hideCompleted, filterCategory, activeTab })
    )
        console.log("%c Line:29 🍆 filteredItems", "color:#7f2b82", filteredItems);

    return filteredItems;
}

/** Helper: Tab filter logic */
function matchTab(task: ChecklistItem, activeTab: string): boolean {
    switch (activeTab) {
        case TABS.today:
            return !task.isArchived && !task.isHidden
        case TABS.scheduled:
            return task.mode === 'scheduled' && !task.isHidden;
        case TABS.hidden:
            return task.isHidden
        case TABS.archived:
            return task.isArchived  && !task.isHidden
        case TABS.priority:
            return task.isPriority && !task.isHidden
        default:
            return true
    }
}

/** Helper: Mode, Completion, Category filter logic */
function matchFilters(
    task: ChecklistItem,
    { activeFilters, hideCompleted, filterCategory, activeTab }: Omit<FilterParams, 'items' | 'isHiddenToday'>
): boolean {
    // skip subtasks for main filters
    if (task.parentUuid) return false;

    // hide completed

    if (hideCompleted && task.done) return false;
    console.log("%c Line:68 🌭 filterCategory", "color:#6ec1c2", filterCategory);

    // Category filter
    if (!isCategoryIncluded(filterCategory, task.category, task.parentUuid)) return false;

    // Hidden filter (for all tabs except Hidden)
    if (activeTab !== TABS.hidden && task.isHidden) return false

    // Active filters (tags/modes)
    if (activeFilters.length > 0) {
        // OR logic: task must have at least one activeFilter tag
        if (!activeFilters.some(tag => tag === task.mode)) return false
    }

    return true
}
