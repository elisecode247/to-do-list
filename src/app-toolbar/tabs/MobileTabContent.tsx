import {
    Archive,
    CalendarCheck,
    CalendarDays,
    EyeOff,
    PencilLine,
    Search,
    Star,
} from 'lucide-react';
import {
    MOBILE_TAB_LABELS,
    TABS,
    type Tab,
} from './types';

type MobileTabContentProps = {
    tab: Tab;
};

export default function MobileTabContent({ tab }: MobileTabContentProps) {
    const iconProps = {
        size: 24,
        strokeWidth: 2.25,
        'aria-hidden': true,
    };

    const icon = tab === TABS.journal
        ? <PencilLine {...iconProps} />
        : tab === TABS.priority
            ? <Star {...iconProps} />
            : tab === TABS.today
                ? <CalendarCheck {...iconProps} />
                : tab === TABS.upcoming
                    ? <CalendarDays {...iconProps} />
                    : tab === TABS.hidden
                        ? <EyeOff {...iconProps} />
                        : tab === TABS.archived
                            ? <Archive {...iconProps} />
                            : <Search {...iconProps} />;

    return (
        <>
            {icon}
            <span>{MOBILE_TAB_LABELS[tab]}</span>
        </>
    );
}
