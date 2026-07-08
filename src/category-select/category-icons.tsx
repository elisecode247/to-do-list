import type { CategoryIconKey } from './types';
import { CATEGORY_ICON_COMPONENTS } from './category-constants';

export function CategoryIcon({ iconKey, size = 16, color = "#ffffff" }: { iconKey?: string; size?: number; color?: string }) {
    if (!iconKey) return null;
    const Icon = CATEGORY_ICON_COMPONENTS[iconKey as CategoryIconKey];
    if (!Icon) return null;
    return <Icon size={size} aria-hidden="true" color={color} />;
}
