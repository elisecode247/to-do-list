import React from 'react';
import './EmptyStateFilters.css';
import { FilterX, Leaf, Moon, Heart, Snowflake, ListChecks, Fish } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ALL_CATEGORIES, getCategoryLabel, NO_CATEGORY_ID } from 'src/category-select/category-constants';
import type { Mode } from 'src/app/types';
import { ALL_MODES } from 'src/checklist/constants';
import type { ThemeStyle } from 'src/themes/types';
import { useTheme } from 'src/themes/use-theme';
import { useUserSettings } from 'src/user-settings/use-user-settings';

interface EmptyStateFiltersProps {
    modeFilter: Mode | typeof ALL_MODES;
    filterCategory: string;
    hideCompleted: boolean;
    sharedByMe?: boolean;
    sharedByOthers?: boolean;
    onClearFilters: () => void;
    type?: 'completedDay' | 'noTasks' | 'noFilters';
}

const completedDayTitle = 'That’s everything for today';
const completedDaySubtitle = 'You can view completed tasks by unchecking "Hide Completed" in the filters above.';
const noFiltersTitle = 'No tasks match your filters';
const noTasksTitle = 'No tasks yet';

const themeIcons: Record<ThemeStyle, LucideIcon> = {
    calm: ListChecks,
    space: Moon,
    nature: Leaf,
    ocean: Fish,
    winter: Snowflake,
    custom: Heart,
};

const EmptyStateFilters: React.FC<EmptyStateFiltersProps> = ({
    modeFilter,
    filterCategory,
    hideCompleted,
    sharedByMe = false,
    sharedByOthers = false,
    onClearFilters,
    type = 'noTasks',
}) => {
    const { categories } = useUserSettings();
    const { style } = useTheme();
    const ThemeIcon = themeIcons[style];
    const filterCategoryLabel = filterCategory === NO_CATEGORY_ID
        ? 'No category'
        : getCategoryLabel(categories, filterCategory);

    const hasFilters = modeFilter !== ALL_MODES
        || filterCategory !== ALL_CATEGORIES
        || hideCompleted
        || sharedByMe
        || sharedByOthers;

    return (
        <div className="empty-state">
            <div className="empty-state__icon">
                <ThemeIcon size={26} strokeWidth={1.75} />
            </div>

            <h2 className="empty-state-title">
                {type === 'completedDay' ? completedDayTitle : type === 'noFilters' ? noFiltersTitle : noTasksTitle}
            </h2>

            {type === 'completedDay' && (
                <p className="empty-state-subtitle">{completedDaySubtitle}</p>
            )}

            {hasFilters ? (
                <>
                    <div className="filters-applied">
                        {modeFilter !== ALL_MODES && (
                            <span className="filters-applied__chip">
                                Frequency: {modeFilter}
                            </span>
                        )}
                        {filterCategory !== ALL_CATEGORIES && (
                            <span className="filters-applied__chip">
                                Category: {filterCategoryLabel}
                            </span>
                        )}
                        {hideCompleted && (
                            <span className="filters-applied__chip">
                                Hide completed
                            </span>
                        )}
                        {sharedByMe && (
                            <span className="filters-applied__chip">
                                Shared by me
                            </span>
                        )}
                        {sharedByOthers && (
                            <span className="filters-applied__chip">
                                Shared by others
                            </span>
                        )}
                    </div>
                    <button onClick={onClearFilters} className="clear-filters-btn">
                        <FilterX size={15} strokeWidth={2} />
                        Clear all filters
                    </button>
                </>
            ) : (
                <div className="empty-state__no-filters">No filters applied</div>
            )}
        </div>
    );
};
export default EmptyStateFilters;
