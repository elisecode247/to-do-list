import React from 'react';
import { ALL_MODES, MODES } from 'src/checklist/constants';
import { ALL_CATEGORIES, getCategoryOptions } from 'src/category-select/category-constants';
import { CategoryIcon } from 'src/category-select/category-icons';
import './app-toolbar.css';
import type { Mode } from 'src/app/types';
import {
    TAB_ARCHIVED,
    TAB_HIDDEN,
    TAB_PRIORITY,
    TAB_TODAY,
    TAB_UPCOMING,
    VIEW_JOURNAL,
    VIEW_SEARCH,
    VIEW_LIST,
    type Tab,
    type View,
} from './tabs/types';
import CloseButton from 'components/close-button/CloseButton';
import type { CategoryDefinition } from 'src/category-select/types';
import { Select } from '@headlessui/react'
import { ListTodo, PencilLine, Search } from 'lucide-react';

const navigationItems: Array<{
    value: View;
    label: string;
    icon: React.ReactNode;
}> = [
    { value: VIEW_SEARCH, label: 'Search', icon: <Search size={16} aria-hidden="true" /> },
    { value: VIEW_JOURNAL, label: 'Journal', icon: <PencilLine size={16} aria-hidden="true" /> },
    { value: VIEW_LIST, label: 'List', icon: <ListTodo size={16} aria-hidden="true" /> },
];
interface AppToolbarProps {
    categories: CategoryDefinition[];
    activeView: View;
    activeTab: Tab;
    handleViewChange: (view: View) => void;
    handleTabChange: (tab: Tab) => void;
    modeFilter: Mode | typeof ALL_MODES;
    setModeFilter: (mode: Mode | typeof ALL_MODES) => void;
    hideCompleted: boolean;
    setHideCompleted: (hide: boolean) => void;
    filterCategory: string;
    setFilterCategory: (category: string) => void;
    hasSharedUsers?: boolean;
    sharedByMe?: boolean;
    setSharedByMe?: (shared: boolean) => void;
    sharedByOthers?: boolean;
    setSharedByOthers?: (shared: boolean) => void;
    setLeftOpen: (open: boolean) => void;
    isDesktop?: boolean;
    showSearch?: boolean;
    listTab?: Tab;
}
const AppToolbar = ({
    activeView,
    activeTab,
    handleTabChange,
    handleViewChange,
    modeFilter,
    setModeFilter,
    hideCompleted,
    setHideCompleted,
    filterCategory,
    setFilterCategory,
    hasSharedUsers = false,
    sharedByMe = false,
    setSharedByMe,
    sharedByOthers = false,
    setSharedByOthers,
    setLeftOpen,
    categories,
}: AppToolbarProps) => {

    const activeFilterCount =
        (hideCompleted ? 1 : 0) +
        (modeFilter === ALL_MODES ? 0 : 1) +
        (filterCategory === ALL_CATEGORIES ? 0 : 1) +
        (sharedByMe ? 1 : 0) +
        (sharedByOthers ? 1 : 0);

    const categoryOptions = getCategoryOptions(categories, {
        includeAll: true,
        includeNone: true,
        includeId: filterCategory,
    });

    const timeframeItems: Array<{ value: Tab; label: string }> = [
        { value: TAB_PRIORITY, label: 'Priority' },
        { value: TAB_TODAY, label: 'Today' },
        { value: TAB_UPCOMING, label: 'Upcoming' },
        { value: TAB_ARCHIVED, label: 'Archived' },
        { value: TAB_HIDDEN, label: 'Not Today' },
    ];

    return (
        <div className="checklist_filter-container">
            <div className="drawer-header">
                <div className="drawer-header-content">
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
                <div className="drawer-section-label">Views</div>
                <nav className="drawer-nav-list" aria-label="App destinations">
                    {navigationItems.map(item => (
                        <button
                            key={item.value}
                            type="button"
                            className={`drawer-nav-item ${activeView === item.value ? 'active' : ''}`}
                            aria-current={activeView === item.value ? 'page' : undefined}
                            onClick={() => handleViewChange(item.value)}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>
            </div>
            {activeView === VIEW_LIST ? (
                <div className="drawer-section">
                    <div className="drawer-section-label">Tabs</div>
                    <div className="drawer-timeframe-chips" role="radiogroup" aria-label="List tabs">
                        {timeframeItems.map(item => (
                            <button
                                key={item.value}
                                type="button"
                                role="radio"
                                aria-checked={activeTab === item.value}
                                className={`drawer-timeframe-chip ${activeTab === item.value ? 'active' : ''}`}
                                onClick={() => handleTabChange(item.value)}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>
            ) : null}
            {activeView === VIEW_LIST ? (
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
            ) : null}
            {activeView === VIEW_LIST ? (
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
                                    aria-pressed={isActive}
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
            ) : null}
            {activeView === VIEW_LIST ? (
                <div className="drawer-section drawer-section--compact">
                    <div className="drawer-section-label">Completed</div>
                    <div className="drawer-toggle-row">
                        <span className="drawer-toggle-label">Hide completed tasks</span>
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
            ) : null}
            {activeView === VIEW_LIST ? (
                hasSharedUsers ? (
                    <div className="drawer-section">
                        <div className="drawer-section-label">Sharing</div>
                        <div className="drawer-sharing-toggles">
                            <div className="drawer-toggle-row">
                                <span className="drawer-toggle-label">Shared by me</span>
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={sharedByMe}
                                    aria-label="Filter tasks shared by me"
                                    className={`drawer-toggle ${sharedByMe ? '' : 'off'}`}
                                    onClick={() => setSharedByMe?.(!sharedByMe)}
                                >
                                    <span className="drawer-toggle-thumb" />
                                </button>
                            </div>
                            <div className="drawer-toggle-row">
                                <span className="drawer-toggle-label">Shared by others</span>
                                <button
                                    type="button"
                                    role="switch"
                                    aria-checked={sharedByOthers}
                                    aria-label="Filter tasks shared by others"
                                    className={`drawer-toggle ${sharedByOthers ? '' : 'off'}`}
                                    onClick={() => setSharedByOthers?.(!sharedByOthers)}
                                >
                                    <span className="drawer-toggle-thumb" />
                                </button>
                            </div>
                        </div>
                    </div>
                ) : null
            ) : null}
        </div>
    );
}

export default AppToolbar;
