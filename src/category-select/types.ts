import { CATEGORY_ICON_KEYS } from './category-icon-keys';
import type { LucideIcon } from 'lucide-react';

export type CategoryIconKey = typeof CATEGORY_ICON_KEYS[number];

export type CategoryIconOption = {
    key: CategoryIconKey;
    label: string;
    Icon: LucideIcon;
};

