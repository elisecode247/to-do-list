import React from 'react';
import Tabs from 'src/app-toolbar/tabs/Tabs';
import { ALL_MODES, MODES } from 'src/checklist/constants';
import { ALL_CATEGORIES, getCategoryOptions, NO_CATEGORY_ID } from 'src/category-select/category-constants';
import './app-toolbar.css';
import type { Mode } from 'src/app/types';
import type { Tab } from './tabs/types';
import CloseButton from 'components/close-button/CloseButton';
import { useUserSettings } from 'src/user-settings/use-user-settings';

interface AppToolbarProps {
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
    setLeftOpen
}: AppToolbarProps) => {
    const { categories } = useUserSettings();
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
                                className={`filter-button ${isActive ? 'filter-button-active' : ''}`}
                            >
                                {mode}
                            </button>
                        )
                    })}
                </div>
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
                                <span
                                    className="drawer-dot"
                                    style={{
                                        backgroundColor: value === ALL_CATEGORIES
                                            ? '#8888ff'
                                            : (value === NO_CATEGORY_ID ? '#94a3b8' : color),
                                    }}
                                />
                                {icon && value !== ALL_CATEGORIES ? <span aria-hidden="true">{icon}</span> : null}
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
