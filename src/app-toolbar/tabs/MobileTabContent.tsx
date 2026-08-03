import {
    Archive,
    CalendarCheck,
    CalendarDays,
    EyeOff,
    Search,
    Star,
} from 'lucide-react';
import {
    TAB_LABELS,
    TAB_ARCHIVED,
    TAB_HIDDEN,
    TAB_PRIORITY,
    TAB_TODAY,
    TAB_UPCOMING,
    type Tab
} from './types';
import type { ReactNode } from 'react';

type MobileTabContentProps = {
    tab: Tab;
};

export default function MobileTabContent({ tab }: MobileTabContentProps) {
    const iconProps = {
        size: 24,
        strokeWidth: 2.25,
        'aria-hidden': true,
    };

    const icons: Partial<Record<Tab, ReactNode>> = {
        [TAB_PRIORITY]: <Star {...iconProps} />,
        [TAB_TODAY]: <CalendarCheck {...iconProps} />,
        [TAB_UPCOMING]: <CalendarDays {...iconProps} />,
        [TAB_HIDDEN]: <EyeOff {...iconProps} />,
        [TAB_ARCHIVED]: <Archive {...iconProps} />,
    };

    const icon = icons[tab] ?? <Search {...iconProps} />;

    return (
        <>
            {icon}
            <span>{TAB_LABELS[tab]}</span>
        </>
    );
}
