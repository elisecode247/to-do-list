

import React from 'react';
import './EmptyStateFilters.css';
import { Filter } from 'lucide-react';
import { ALL_CATEGORIES } from 'src/category-select/category-constants';
import type { Mode } from 'src/app/types';
import { ALL_MODES } from 'src/checklist/constants';

interface EmptyStateFiltersProps {
    modeFilter: Mode | typeof ALL_MODES;
    filterCategory: string;
    hideCompleted: boolean;
    onClearFilters: () => void;
    type?: 'completedDay' | 'noTasks';
}

const completedDayMessage = 'That’s everything for today!\n' +
    'You can view completed tasks by unchecking "Hide Completed"' +
    'in the filters above.';

const EmptyStateFilters: React.FC<EmptyStateFiltersProps> = ({
    modeFilter,
    filterCategory,
    hideCompleted,
    onClearFilters,
    type = 'noTasks',
}) => {

    return (
        <div className="empty-state">
            <h3 className="empty-state-title">
                {type === 'completedDay' ? completedDayMessage : "No tasks match your filters"}
            </h3>

            {(modeFilter !== ALL_MODES || filterCategory !== ALL_CATEGORIES || hideCompleted) ? (
                <>
                <div className="filters-applied">
                    <span className="filters-applied__label">Filters applied</span>
                    <ul className="filters-applied__list">
                        {modeFilter !== ALL_MODES && (
                            <li className="filters-applied__item">
                                Frequency Type: {modeFilter}
                            </li>
                        )}
                        {filterCategory !== ALL_CATEGORIES && (
                            <li className="filters-applied__item">
                                Category: {!!filterCategory ? filterCategory : 'No category'}
                            </li>)}
                        {hideCompleted && (
                            <li className="filters-applied__item">
                                Hide completed
                            </li>
                        )}
                    </ul>
                </div>
                <button onClick={onClearFilters} className="clear-filters-btn">
                    <Filter size={24} />
                    Clear all filters
                </button>
                </>
            ) : <div className="empty-state_no-filters">No filters applied</div>}
        </div>
    );
};
export default EmptyStateFilters;
