export const TAB_PRIORITY = 'priority';
export const TAB_TODAY = 'today';
export const TAB_SCHEDULED = 'scheduled';
export const TAB_HIDDEN = 'hidden';
export const TAB_ARCHIVED = 'archived';

export type Tab = typeof TAB_PRIORITY | typeof TAB_TODAY | typeof TAB_SCHEDULED | typeof TAB_HIDDEN | typeof TAB_ARCHIVED;

export const TABS = {
    priority: TAB_PRIORITY as Tab,
    today: TAB_TODAY as Tab,
    scheduled: TAB_SCHEDULED as Tab,
    hidden: TAB_HIDDEN as Tab,
    archived: TAB_ARCHIVED as Tab
}
