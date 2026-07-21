import type { ChecklistItem, FilterParams } from 'app/types';
import type { Mode } from 'src/app/types';
import { isCategoryIncluded } from 'src/category-select/category-constants';
import { TABS } from 'src/app-toolbar/tabs/types';
import { ALL_MODES } from 'src/checklist/constants';

export function filterTasks({
    items,
    activeTab,
    modeFilter,
    hideCompleted,
    filterCategory,
    sharedByMe = false,
    sharedByOthers = false,
}: FilterParams): ChecklistItem[] {
    if (!items.length) return [];

    return items.filter(task =>
        matchTab(task, activeTab) &&
        matchCommonFilters(task, {
            modeFilter,
            hideCompleted,
            filterCategory,
            sharedByMe,
            sharedByOthers,
        })
    );
}


/** Helper: Get today's date at midnight in local timezone for comparison */
export function getLocalTodayAtMidnight(): Date {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
}

/** Helper: Tab filter logic */
function matchTab(task: ChecklistItem, activeTab: string): boolean {
    const isCompletedToday = task.done && getLocalTodayAtMidnight().toDateString() === new Date(task.lastCompleted).toDateString();
    switch (activeTab) {
        case TABS.today:
            return !task.isArchived && !task.isHidden && !isSubtask(task) &&
                (!task.nextDue || new Date(task.nextDue) <= getLocalTodayAtMidnight() || isCompletedToday);

        case TABS.upcoming:
            return (!!task.nextDue && new Date(task.nextDue) > getLocalTodayAtMidnight()) &&
                !task.isHidden && !isSubtask(task) && !task.isArchived;

        case TABS.hidden:
            return task.isHidden;

        case TABS.archived:
            return task.isArchived && !task.isHidden;

        case TABS.priority:
            return task.isPriority && !task.isHidden && !task.isArchived;

        default:
            return true;
    }
}

function matchCommonFilters(
    task: ChecklistItem,
    {
        modeFilter,
        hideCompleted,
        filterCategory,
        sharedByMe,
        sharedByOthers,
    }: {
        modeFilter: Mode | typeof ALL_MODES;
        hideCompleted: boolean;
        filterCategory: string;
        sharedByMe: boolean;
        sharedByOthers: boolean;
    }
): boolean {
    if (isCompleted(hideCompleted, task)) return false;
    if (!isCategory(filterCategory, task)) return false;
    if (!isMode(modeFilter, task)) return false;
    if (!isSharingMatch(sharedByMe, sharedByOthers, task)) return false;
    return true;
}

const isSubtask = (task: ChecklistItem): boolean => {
    if (!task.isOwner && task.accessRole !== 'owner') return false;
    return !!task.parentUuid;
};
const isCompleted = (hideCompleted: boolean, task: ChecklistItem): boolean => hideCompleted && task.done;
const isCategory = (selectedCategory: string, task: ChecklistItem): boolean => isCategoryIncluded(selectedCategory, task.category);
const isMode = (modeFilter: Mode | typeof ALL_MODES, task: ChecklistItem): boolean => {
    return modeFilter === ALL_MODES || modeFilter === task.mode;
}
const isSharingMatch = (
    sharedByMe: boolean,
    sharedByOthers: boolean,
    task: ChecklistItem,
): boolean => {
    if (!sharedByMe && !sharedByOthers) return true;

    const isSharedByMe = task.accessRole === 'owner' && task.hasMembers;
    const isSharedByOthers = task.accessRole !== 'owner';

    return (sharedByMe && isSharedByMe) || (sharedByOthers && isSharedByOthers);
};
