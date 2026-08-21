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
        [VIEWS.search]: <img src="./magnifier.svg" width={24} {...iconProps} />,
        [VIEWS.journal]: <img src="./feather-pen.svg" width={24} {...iconProps} />,
        [VIEWS.list]: <img src="./list.svg" width={24} {...iconProps} />,
    };

    return (
        <>
            {icons[view]}
            <span>{VIEW_LABELS[view]}</span>
        </>
    );
}
