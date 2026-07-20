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

    const icons = {
        [TABS.journal]: <PencilLine {...iconProps} />,
        [TABS.priority]: <Star {...iconProps} />,
        [TABS.today]: <CalendarCheck {...iconProps} />,
        [TABS.upcoming]: <CalendarDays {...iconProps} />,
        [TABS.hidden]: <EyeOff {...iconProps} />,
        [TABS.archived]: <Archive {...iconProps} />,
    } as const;

    const icon = icons[tab] ?? <Search {...iconProps} />;

    return (
        <>
            {icon}
            <span>{MOBILE_TAB_LABELS[tab]}</span>
        </>
    );
}
