export const TAB_PRIORITY = 'priority';
export const TAB_TODAY = 'today';
export const TAB_UPCOMING = 'upcoming';
export const TAB_HIDDEN = 'hidden';
export const TAB_ARCHIVED = 'archived';
export const VIEW_JOURNAL = 'journal';
export const VIEW_SEARCH = 'search';
export const VIEW_LIST = 'list';

export type Tab = typeof TAB_PRIORITY | typeof TAB_TODAY | typeof TAB_UPCOMING |
 typeof TAB_HIDDEN | typeof TAB_ARCHIVED;

export const LIST_TABS = [
    TAB_PRIORITY,
    TAB_TODAY,
    TAB_UPCOMING,
    TAB_ARCHIVED,
    TAB_HIDDEN,
] as const satisfies readonly Tab[];

export type View = typeof VIEW_SEARCH | typeof VIEW_JOURNAL | typeof VIEW_LIST;

export const VIEWS = {
    search: VIEW_SEARCH as View,
    journal: VIEW_JOURNAL as View,
    list: VIEW_LIST as View,
};

export const VIEW_LABELS: Record<View, string> = {
    [VIEW_SEARCH]: 'Search',
    [VIEW_JOURNAL]: 'Journal',
    [VIEW_LIST]: 'List',
};

export const TAB_LABELS: Record<Tab, string> = {
    [TAB_PRIORITY]: 'Priority',
    [TAB_TODAY]: 'Today',
    [TAB_UPCOMING]: 'Upcoming',
    [TAB_HIDDEN]: 'Not Today',
    [TAB_ARCHIVED]: 'Archived'
}
