

import React from 'react';
import type { Tag } from '../constants';
import './EmptyStateFilters.css';
import { Filter } from 'lucide-react';
import { ALL_CATEGORIES } from 'src/category-select/category-constants';

interface EmptyStateFiltersProps {
    activeFilters: Tag[];
    filterCategory: string;
    hideCompleted: boolean;
    onClearFilters: () => void;
}

const EmptyStateFilters: React.FC<EmptyStateFiltersProps> = ({
    activeFilters,
    filterCategory,
    hideCompleted,
    onClearFilters,
}) => {

    return (
        <div className="empty-state">
            <h3 className="empty-state-title">No tasks found</h3>

            {(activeFilters.length || filterCategory !== ALL_CATEGORIES || hideCompleted) ? (
                <>
                <div className="filters-applied">
                    <span className="filters-applied__label">Filters applied</span>
                    <ul className="filters-applied__list">
                        {activeFilters.map(filter => (
                            <li className="filters-applied__item">
                                Frequency Type: {filter}
                            </li>
                        ))}
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
