import React from 'react';
import Tabs from 'src/app-toolbar/tabs/Tabs';
import { ALL_MODES, MODES } from 'src/checklist/constants';
import { ALL_CATEGORIES, getCategoryOptions } from 'src/category-select/category-constants';
import { CategoryIcon } from 'src/category-select/category-icons';
import './app-toolbar.css';
import type { Mode } from 'src/app/types';
import type { Tab } from './tabs/types';
import CloseButton from 'components/close-button/CloseButton';
import type { CategoryDefinition } from 'src/category-select/types';
import { Select } from '@headlessui/react'

interface AppToolbarProps {
    categories: CategoryDefinition[];
    activeTab: Tab;
    handleTabChange: (tab: Tab) => void;
    modeFilter: Mode | typeof ALL_MODES;
    setModeFilter: (mode: Mode | typeof ALL_MODES) => void;
    hideCompleted: boolean;
    setHideCompleted: (hide: boolean) => void;
    filterCategory: string;
    setFilterCategory: (category: string) => void;
    setLeftOpen: (open: boolean) => void;
    isDesktop?: boolean;
}
const AppToolbar = ({
    activeTab,
    handleTabChange,
    modeFilter,
    setModeFilter,
    hideCompleted,
    setHideCompleted,
    filterCategory,
    setFilterCategory,
    setLeftOpen,
    categories
}: AppToolbarProps) => {

    const activeFilterCount =
        (hideCompleted ? 1 : 0) +
        (modeFilter === ALL_MODES ? 0 : 1) +
        (filterCategory === ALL_CATEGORIES ? 0 : 1);

    const categoryOptions = getCategoryOptions(categories, {
        includeAll: true,
        includeNone: true,
        includeId: filterCategory,
    });

    return (
        <div className="checklist_filter-container">
            <div className="drawer-header">
                <div>
                    <span className="drawer-title">Filters</span>
                    {activeFilterCount > 0 && (
                        <span className="drawer-badge">{activeFilterCount}</span>
                    )}
                </div>
                <CloseButton
                    onClick={() => setLeftOpen(false)}
                    label="Close filters panel"
                />
            </div>

            <div className="drawer-section">
                <div className="drawer-section-label">View</div>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                />
            </div>

            <div className="drawer-divider" />

            <div className="drawer-section">
                <div className="drawer-section-label">Mode</div>
                <Select
                    className="mode-filter-button-group"
                    name="mode-filter"
                    aria-label="Mode filter"
                    value={modeFilter}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                        setModeFilter(e.target.value as Mode);
                    }}
                >
                    <option value={ALL_MODES}>
                        All
                    </option>
                    {MODES.map((mode: Mode): React.ReactNode => (
                        <option key={mode} value={mode}>
                            {mode}
                        </option>
                    ))}
                </Select>
            </div>

            <div className="drawer-divider" />

            <div className="drawer-section">
                <div className="drawer-section-label">Category</div>
                <div className="drawer-category-pills">
                    {categoryOptions.map(({ value, label, color, icon }) => {
                        const isActive = filterCategory === value;
                        const displayLabel = value === ALL_CATEGORIES ? 'All' : label;
                        return (
                            <button
                                key={value}
                                type="button"
                                className={`drawer-category-pill ${isActive ? 'active' : ''}`}
                                onClick={() => setFilterCategory(value)}
                            >
                                {value !== ALL_CATEGORIES ? <CategoryIcon iconKey={icon} color={color} /> : null}
                                {displayLabel}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="drawer-divider" />

            <div className="drawer-section drawer-section--compact">
                <div className="drawer-toggle-row">
                    <span className="drawer-toggle-label">Hide Completed Tasks</span>
                    <button
                        type="button"
                        role="switch"
                        aria-checked={hideCompleted}
                        aria-label="Hide completed tasks"
                        className={`drawer-toggle ${hideCompleted ? '' : 'off'}`}
                        onClick={() => setHideCompleted(!hideCompleted)}
                    >
                        <span className="drawer-toggle-thumb" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AppToolbar;
