import { VIEW_LABELS, VIEWS, type View } from './types';

type MobileViewContentProps = {
    view: View;
};

export default function MobileViewContent({ view }: MobileViewContentProps) {
    const iconProps = {
        size: 24,
        strokeWidth: 2.25,
        'aria-hidden': true,
    };

    const icons = {
        [VIEWS.search]: <img src="./magnifying-glass2.svg" width={24} {...iconProps} />,
        [VIEWS.journal]: <img src="./pen2.svg" width={24} {...iconProps} />,
        [VIEWS.list]: <img src="./task-list.svg" width={24} {...iconProps} />,
    };

    return (
        <>
            {icons[view]}
            <span>{VIEW_LABELS[view]}</span>
        </>
    );
}
