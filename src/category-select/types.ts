import { CATEGORY_ICON_KEYS } from './category-constants';
import type { LucideIcon } from 'lucide-react';

export type CategoryIconKey = typeof CATEGORY_ICON_KEYS[number];

export type CategoryIconOption = {
    key: CategoryIconKey;
    label: string;
    Icon: LucideIcon;
};

export type BuiltInCategoryKey = 'work' | 'housework' | 'self-care' | 'people' | 'pets' | 'leisure';

export type ServerCategoryDefinition = {
    uuid: string;
    name: string;
    color: string;
    icon: string;
    isVisible: boolean;
    isBuiltIn: boolean;
    builtInKey: BuiltInCategoryKey;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
}
export interface CategoryDefinition {
    id: string;
    name: string;
    color: string;
    icon?: string;
    isVisible: boolean;
    isBuiltIn: boolean;
    isDeleted?: boolean;
    builtInKey?: BuiltInCategoryKey;
}

export interface CategoryOption {
    value: string;
    label: string;
    color?: string;
    icon?: string;
    isHidden?: boolean;
    isDeleted?: boolean;
}
