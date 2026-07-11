import React from 'react';
import './EmptyStateFilters.css';
import { Moon, FilterX } from 'lucide-react';
import { ALL_CATEGORIES, getCategoryLabel, NO_CATEGORY_ID } from 'src/category-select/category-constants';
import type { Mode } from 'src/app/types';
import { ALL_MODES } from 'src/checklist/constants';
import { useUserSettings } from 'src/user-settings/use-user-settings';

interface EmptyStateFiltersProps {
    modeFilter: Mode | typeof ALL_MODES;
    filterCategory: string;
    hideCompleted: boolean;
    onClearFilters: () => void;
    type?: 'completedDay' | 'noTasks';
}

const completedDayTitle = 'That’s everything for today';
const completedDaySubtitle = 'You can view completed tasks by unchecking "Hide Completed" in the filters above.';
const noTasksTitle = 'No tasks match your filters';

const EmptyStateFilters: React.FC<EmptyStateFiltersProps> = ({
    modeFilter,
    filterCategory,
    hideCompleted,
    onClearFilters,
    type = 'noTasks',
}) => {
    const { categories } = useUserSettings();
    const filterCategoryLabel = filterCategory === NO_CATEGORY_ID
        ? 'No category'
        : getCategoryLabel(categories, filterCategory);

    const hasFilters = modeFilter !== ALL_MODES || filterCategory !== ALL_CATEGORIES || hideCompleted;

    return (
        <div className="empty-state">
            <div className="empty-state__icon">
                <Moon size={26} strokeWidth={1.75} />
            </div>

            <h3 className="empty-state-title">
                {type === 'completedDay' ? completedDayTitle : noTasksTitle}
            </h3>

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
