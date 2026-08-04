import {
    TAB_LABELS,
    VIEW_LABELS,
    VIEW_LIST,
    type ListTab,
    type View,
} from './tabs/types';
import './view-breadcrumb.css';

interface ViewBreadcrumbProps {
    activeView: View;
    activeTab: ListTab;
    appliedFilterCount?: number;
    placement: 'desktop' | 'mobile';
}

export default function ViewBreadcrumb({
    activeView,
    activeTab,
    appliedFilterCount = 0,
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
            {parts.map((part, index) => (
                <span key={part} className="view-breadcrumb__part">
                    {index > 0 ? <span className="view-breadcrumb__separator" aria-hidden="true">·</span> : null}
                    {part}
                </span>
            ))}
        </div>
    );
}
