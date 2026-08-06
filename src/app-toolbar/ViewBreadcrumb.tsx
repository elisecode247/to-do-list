import {
    LIST_TABS,
    TAB_LABELS,
    VIEW_LABELS,
    VIEW_LIST,
    type ListTab,
    type View,
} from './tabs/types';
import { ChevronDown } from 'lucide-react';
import './view-breadcrumb.css';

interface ViewBreadcrumbProps {
    activeView: View;
    activeTab: ListTab;
    appliedFilterCount?: number;
    onTabChange: (tab: ListTab) => void;
    placement: 'desktop' | 'mobile';
}

export default function ViewBreadcrumb({
    activeView,
    activeTab,
    appliedFilterCount = 0,
    onTabChange,
    placement,
}: ViewBreadcrumbProps) {
    const parts = [VIEW_LABELS[activeView]];

    if (activeView === VIEW_LIST) {
        parts.push(TAB_LABELS[activeTab]);
        if (appliedFilterCount > 0) {
            parts.push(`${appliedFilterCount} ${appliedFilterCount === 1 ? 'filter' : 'filters'}`);
        }
    }

    return (
        <div
            className={`view-breadcrumb view-breadcrumb--${placement}`}
            aria-label={`Current location: ${parts.join(', ')}`}
        >
            <span className="view-breadcrumb__part view-breadcrumb__part--context">
                {VIEW_LABELS[activeView]}
            </span>
            {activeView === VIEW_LIST ? (
                <>
                    <span className="view-breadcrumb__separator" aria-hidden="true">·</span>
                    <span className="view-breadcrumb__part view-breadcrumb__part--tab">
                        <select
                            className="view-breadcrumb__tab-select"
                            aria-label="Change list tab"
                            value={activeTab}
                            onChange={(event) => onTabChange(event.target.value as ListTab)}
                        >
                            {LIST_TABS.map(tab => (
                                <option key={tab} value={tab}>
                                    {TAB_LABELS[tab]}
                                </option>
                            ))}
                        </select>
                        <ChevronDown
                            className="view-breadcrumb__tab-chevron"
                            size={14}
                            strokeWidth={2.25}
                            aria-hidden="true"
                        />
                    </span>
                    {appliedFilterCount > 0 ? (
                        <>
                            <span className="view-breadcrumb__separator" aria-hidden="true">·</span>
                            <span
                                className="view-breadcrumb__part view-breadcrumb__part--context view-breadcrumb__part--filters"
                                aria-label={`${appliedFilterCount} ${appliedFilterCount === 1 ? 'filter' : 'filters'}`}
                            >
                                <span>{appliedFilterCount}</span>
                                <span className="view-breadcrumb__filter-label" aria-hidden="true">
                                    {' '}{appliedFilterCount === 1 ? 'filter' : 'filters'}
                                </span>
                            </span>
                        </>
                    ) : null}
                </>
            ) : null}
        </div>
    );
}
