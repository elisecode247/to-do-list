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

    return items
        .map(task => ({
            ...task,
            isHidden: isHiddenToday(task.id),
        }))
        .filter(task =>
            matchTab(task, activeTab) &&
            matchTabSpecificRules(task, activeTab) &&
            matchCommonFilters(task, {
                activeFilters,
                hideCompleted,
                filterCategory,
            })
        );
}


/** Helper: Tab filter logic */
function matchTab(task: ChecklistItem, activeTab: string): boolean {
    switch (activeTab) {
        case TABS.today:
            return !task.isArchived
        case TABS.scheduled:
            return task.mode === 'scheduled';
        case TABS.hidden:
            return task.isHidden
        case TABS.archived:
            return task.isArchived
        case TABS.priority:
            return task.isPriority
        default:
            return true;
    }
}

function matchTabSpecificRules(
    task: ChecklistItem,
    activeTab: string
): boolean {
    switch (activeTab) {
        case TABS.hidden:
            return task.isHidden;
        case TABS.priority:
        case TABS.archived:
            return !task.isHidden;
        case TABS.today:
        case TABS.scheduled:
            return !isSubtask(task) && !task.isHidden;
        default:
            return true;
    }
}

function matchCommonFilters(
    task: ChecklistItem,
    {
        activeFilters,
        hideCompleted,
        filterCategory,
    }: {
        activeFilters: string[];
        hideCompleted: boolean;
        filterCategory: string;
    }
): boolean {
    if (isCompleted(hideCompleted, task)) return false;
    if (!isCategory(filterCategory, task)) return false;
    if (!hasMode(activeFilters, task)) return false;
    return true;
}

const isSubtask = (task: ChecklistItem): boolean => !!task.parentUuid;
const isCompleted = (hideCompleted: boolean, task: ChecklistItem): boolean => hideCompleted && task.done;
const isCategory = (selectedCategory: string, task: ChecklistItem): boolean => isCategoryIncluded(selectedCategory, task.category);
const hasMode = (activeFilters: string[], task: ChecklistItem): boolean => {
    return activeFilters.length === 0 || activeFilters.includes(task.mode);
}
