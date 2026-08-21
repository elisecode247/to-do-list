import {
    LIST_TABS,
    TAB_LABELS,
    TAB_TODAY,
    VIEW_LABELS,
    VIEW_LIST,
    VIEWS,
    type ListTab,
    type View,
} from './tabs/types';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { ChevronDown } from 'lucide-react';
import './view-breadcrumb.css';

interface ViewBreadcrumbProps {
    activeView: View;
    activeTab: ListTab;
    onTabChange: (tab: ListTab) => void;
    onViewChange: (view: View) => void;
    placement: 'desktop' | 'mobile';
}

export default function ViewBreadcrumb({
    activeView,
    activeTab,
    onTabChange,
    onViewChange,
    placement,
}: ViewBreadcrumbProps) {
    const parts = [VIEW_LABELS[activeView]];

    if (activeView === VIEW_LIST) {
        parts.push(TAB_LABELS[activeTab]);
    }

    return (
        <div
            className={`view-breadcrumb view-breadcrumb--${placement}`}
            aria-label={`Current location: ${parts.join(', ')}`}
        >
            <span className="view-breadcrumb__part view-breadcrumb__part--context view-breadcrumb__part--view">
                <Menu>
                    <MenuButton className="view-breadcrumb__menu-button" aria-label="Change view">
                        {VIEW_LABELS[activeView]}
                        <ChevronDown size={14} strokeWidth={2.25} aria-hidden="true" />
                    </MenuButton>
                    <MenuItems
                        anchor="bottom start"
                        transition
                        className="view-breadcrumb__menu-items"
                    >
                        {Object.values(VIEWS).map(view => (
                            <MenuItem key={view}>
                                <button
                                    className={`view-breadcrumb__menu-item ${view === activeView ? 'is-active' : ''}`}
                                    aria-current={view === activeView ? 'true' : undefined}
                                    onClick={() => onViewChange(view)}
                                >
                                    {VIEW_LABELS[view]}
                                </button>
                            </MenuItem>
                        ))}
                    </MenuItems>
                </Menu>
            </span>
            {activeView === VIEW_LIST ? (
                <>
                    <span className="view-breadcrumb__separator" aria-hidden="true">·</span>
                    <span className="view-breadcrumb__part view-breadcrumb__part--tab">
                        <Menu>
                            <MenuButton
                                className={`view-breadcrumb__menu-button ${activeTab === TAB_TODAY ? 'view-breadcrumb__menu-button--today' : ''}`}
                                aria-label="Change list tab"
                            >
                                {activeTab === TAB_TODAY ? (
                                    <img src="/sun.svg" alt="" width={24} height={24} aria-hidden="true" />
                                ) : null}
                                {TAB_LABELS[activeTab]}
                                <ChevronDown size={14} strokeWidth={2.25} aria-hidden="true" />
                            </MenuButton>
                            <MenuItems
                                anchor="bottom start"
                                transition
                                className="view-breadcrumb__menu-items"
                            >
                                {LIST_TABS.map(tab => (
                                    <MenuItem key={tab}>
                                        <button
                                            className={`view-breadcrumb__menu-item ${tab === activeTab ? 'is-active' : ''}`}
                                            aria-current={tab === activeTab ? 'true' : undefined}
                                            onClick={() => onTabChange(tab)}
                                        >
                                            {TAB_LABELS[tab]}
                                        </button>
                                    </MenuItem>
                                ))}
                            </MenuItems>
                        </Menu>
                    </span>
                </>
            ) : null}
        </div>
    );
}
