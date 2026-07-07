import { createContext } from "react";
import type { CategoryDefinition } from "src/category-select/category-constants";

export type CreateCategoryInput = {
    name: string;
    color: string;
    icon?: string;
};

export type UserSettingsContextValue = {
    googleCalendarEnabled: boolean;
    categories: CategoryDefinition[];
    isLoadingSettings: boolean;
    updateEnableCalendar: (nextValue: boolean) => Promise<void>;
    createCategory: (input: CreateCategoryInput) => string;
    updateCategory: (id: string, updates: Partial<CreateCategoryInput>) => void;
    setCategoryVisibility: (id: string, isVisible: boolean) => void;
    deleteCategory: (id: string) => void;
};

export const UserSettingsContext = createContext<UserSettingsContextValue | null>(null);
