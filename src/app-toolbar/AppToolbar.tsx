import React from 'react';
import { Filter } from 'lucide-react';
import Tabs from 'src/app-toolbar/tabs/Tabs';
import CategorySelect from 'category-select/CategorySelect';
import { ALL_MODES, MODES } from 'src/checklist/constants';
import { getModeColor } from 'src/checklist/utilities/get-mode-color';
import './app-toolbar.css';
import type { Mode } from 'src/app/types';
import type { Tab } from './tabs/types';

interface AppToolbarProps {
    showFilters: boolean;
    setShowFilters: (show: boolean) => void;
    activeTab: Tab;
    handleTabChange: (tab: Tab) => void;
    modeFilter: Mode | typeof ALL_MODES;
    setModeFilter: (mode: Mode | typeof ALL_MODES) => void;
    hideCompleted: boolean;
    setHideCompleted: (hide: boolean) => void;
    filterCategory: string;
    setFilterCategory: (category: string) => void;
}
const AppToolbar = ({
    showFilters,
    setShowFilters,
    activeTab,
    handleTabChange,
    modeFilter,
    setModeFilter,
    hideCompleted,
    setHideCompleted,
    filterCategory,
    setFilterCategory
}: AppToolbarProps) => {

    return (
        <div className="checklist_toolbar">
            <div className="checklist_filter-container">
                <button
                    className="filter-toggle-icon-button"
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <Filter size={24} />Filters
                </button>
                {showFilters && (<>
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                    />
                    <div className="mode-filter-button-group">
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
                        {MODES.map((mode: Mode): React.ReactNode => {
                            const isActive = modeFilter === mode;
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
                    </div>
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
        </div>
    );
}

export default AppToolbar;
