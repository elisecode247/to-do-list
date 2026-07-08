import type { CategoryIconKey } from './types';
import { CATEGORY_ICON_COMPONENTS } from './category-constants';

type CategoryIconProps = {
    iconKey?: string;
    size?: number;
    color?: string;
};

export function CategoryIcon({ iconKey, size = 16, color = '#ffffff' }: CategoryIconProps) {
    const Icon = iconKey ? CATEGORY_ICON_COMPONENTS[iconKey as CategoryIconKey] : undefined;
    console.log("%c Line:12 🍯 iconKey", "color:#b03734", iconKey);

    if (!Icon) {
        return <div
            className="category-dot-icon"
            style={{ '--category-background-color': color } as React.CSSProperties}
        />
    }

    return <Icon size={size} aria-hidden="true" color={color} />;
}
