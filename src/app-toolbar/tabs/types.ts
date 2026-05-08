export const TAB_PRIORITY = 'priority';
export const TAB_TODAY = 'today';
export const TAB_UPCOMING = 'upcoming';
export const TAB_HIDDEN = 'hidden';
export const TAB_ARCHIVED = 'archived';
export const TAB_JOURNAL = 'journal';

export type Tab = typeof TAB_PRIORITY | typeof TAB_TODAY | typeof TAB_UPCOMING |
 typeof TAB_HIDDEN | typeof TAB_ARCHIVED | typeof TAB_JOURNAL;

export const TABS = {
    priority: TAB_PRIORITY as Tab,
    today: TAB_TODAY as Tab,
    upcoming: TAB_UPCOMING as Tab,
    hidden: TAB_HIDDEN as Tab,
    archived: TAB_ARCHIVED as Tab,
    journal: TAB_JOURNAL as Tab,
}

export const TAB_LABELS: Record<Tab, string> = {
    [TAB_PRIORITY]: '⭐ Priority',
    [TAB_TODAY]: 'Today',
    [TAB_UPCOMING]: 'Upcoming',
    [TAB_HIDDEN]: 'Hidden',
    [TAB_ARCHIVED]: 'Archived',
    [TAB_JOURNAL]: 'Journal'
}
