import { normalizeCategoryIcon } from './category-icon-keys';
import type { CategoryIconKey, CategoryIconOption } from './types';
export const ALL_CATEGORIES = "all";
export const NO_CATEGORY_ID = "";
import {
    type LucideIcon,
    Briefcase,
    House,
    Heart,
    Users,
    PawPrint,
    Sparkles,
    BookOpen,
    Coffee,
    Dumbbell,
    Flower2,
    Music,
    Plane,
    CalendarDays,
    ShoppingCart,
    Receipt,
    Wallet,
    Laptop,
    Wrench,
    Smartphone,
    Pill,
    GraduationCap,
    Car,
    ClipboardList,
    Bell,
} from 'lucide-react';

export interface CategoryDefinition {
    id: string;
    name: string;
    color: string;
    icon?: string;
    isVisible: boolean;
    isBuiltIn: boolean;
    isDeleted?: boolean;
}

export interface CategoryOption {
    value: string;
    label: string;
    color?: string;
    icon?: string;
    isHidden?: boolean;
    isDeleted?: boolean;
}

export const DEFAULT_CATEGORIES: CategoryDefinition[] = [
    {
        id: "work",
        name: "Work",
        color: "#4ade80",
        icon: "briefcase",
        isVisible: true,
        isBuiltIn: true,
    },
    {
        id: "housework",
        name: "Home",
        color: "#fbbf24",
        icon: "house",
        isVisible: true,
        isBuiltIn: true,
    },
    {
        id: "self-care",
        name: "Self-Care",
        color: "#f87171",
        icon: "heart",
        isVisible: true,
        isBuiltIn: true,
    },
    {
        id: "people",
        name: "People",
        color: "#38bdf8",
        icon: "users",
        isVisible: true,
        isBuiltIn: true,
    },
    {
        id: "pets",
        name: "Pets",
        color: "#a78bfa",
        icon: "paw",
        isVisible: true,
        isBuiltIn: true,
    },
    {
        id: "leisure",
        name: "Leisure",
        color: "#34d399",
        icon: "sparkles",
        isVisible: true,
        isBuiltIn: true,
    },
];

export const categoryArray = DEFAULT_CATEGORIES.map(({ id }) => id);

export const categories = {
    ...Object.fromEntries(DEFAULT_CATEGORIES.map(({ id, name }) => [id, name])),
    [NO_CATEGORY_ID]: "No Category",
};

type CategoryType = string;

const FALLBACK_CUSTOM_CATEGORY_COLOR = "#94a3b8";

function sanitizeString(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
}

function normalizeCategoryDefinition(category: unknown): CategoryDefinition | null {
    if (!category || typeof category !== 'object') return null;

    const candidate = category as Partial<CategoryDefinition>;
    const id = sanitizeString(candidate.id);
    if (!id) return null;

    return {
        id,
        name: sanitizeString(candidate.name) || id,
        color: sanitizeString(candidate.color) || FALLBACK_CUSTOM_CATEGORY_COLOR,
        icon: normalizeCategoryIcon(sanitizeString(candidate.icon)),
        isVisible: typeof candidate.isVisible === 'boolean' ? candidate.isVisible : true,
        isBuiltIn: Boolean(candidate.isBuiltIn),
        isDeleted: Boolean(candidate.isDeleted),
    };
}

export function mergeStoredCategories(storedCategories: unknown): CategoryDefinition[] {
    const normalizedDefaults = DEFAULT_CATEGORIES.map(category => ({ ...category }));
    const defaultMap = new Map(normalizedDefaults.map(category => [category.id, category]));
    const normalizedStored = Array.isArray(storedCategories)
        ? storedCategories.map(normalizeCategoryDefinition)
        : [];

    const mergedDefaults = normalizedDefaults.map(category => {
        const stored = normalizedStored.find(candidate => candidate?.id === category.id);

        if (!stored) return category;

        return {
            ...category,
            name: stored.name || category.name,
            color: stored.color || category.color,
            icon: stored.icon || undefined,
            isVisible: stored.isVisible,
            isDeleted: false,
            isBuiltIn: true,
        };
    });

    const customCategories = normalizedStored
        .filter((category): category is CategoryDefinition => {
            if (!category) return false;
            return !defaultMap.has(category.id);
        })
        .map(category => ({
            ...category,
            isBuiltIn: false,
        }));

    return [...mergedDefaults, ...customCategories];
}

export function getCategoryById(categoryDefinitions: CategoryDefinition[], categoryId: string): CategoryDefinition | undefined {
    return categoryDefinitions.find(category => category.id === categoryId);
}

export function getCategoryLabel(categoryDefinitions: CategoryDefinition[], categoryId: string): string {
    if (categoryId === NO_CATEGORY_ID) {
        return 'No Category';
    }

    return getCategoryById(categoryDefinitions, categoryId)?.name ?? categoryId;
}

export function formatCategoryOptionLabel(category: Pick<CategoryDefinition, 'name' | 'icon' | 'isVisible' | 'isDeleted'>): string {
    const suffix = category.isDeleted ? ' (Removed)' : (!category.isVisible ? ' (Hidden)' : '');
    return `${category.name}${suffix}`;
}

export function getCategoryOptions(
    categoryDefinitions: CategoryDefinition[],
    {
        includeAll = false,
        includeNone = true,
        includeId,
    }: {
        includeAll?: boolean;
        includeNone?: boolean;
        includeId?: string;
    } = {}
): CategoryOption[] {
    const visibleCategories = categoryDefinitions.filter(category => {
        if (category.isDeleted && category.id !== includeId) return false;
        return category.isVisible || category.id === includeId;
    });

    const orderedCategories = [
        ...visibleCategories.filter(category => category.isBuiltIn),
        ...visibleCategories
            .filter(category => !category.isBuiltIn)
            .sort((left, right) => left.name.localeCompare(right.name)),
    ];

    const options: CategoryOption[] = [];

    if (includeAll) {
        options.push({ value: ALL_CATEGORIES, label: 'All Categories', color: '#8888ff' });
    }

    options.push(...orderedCategories.map(category => ({
        value: category.id,
        label: formatCategoryOptionLabel(category),
        color: category.color,
        icon: category.icon,
        isHidden: !category.isVisible,
        isDeleted: Boolean(category.isDeleted),
    })));

    if (includeNone) {
        options.push({ value: NO_CATEGORY_ID, label: 'No Category' });
    }

    const uniqueOptions = new Map<string, CategoryOption>();
    for (const option of options) {
        if (!uniqueOptions.has(option.value)) {
            uniqueOptions.set(option.value, option);
        }
    }

    return [...uniqueOptions.values()];
}

export const isCategoryIncluded = (selectedCategory: CategoryType, taskCategory: CategoryType) => {
    if (selectedCategory === ALL_CATEGORIES) return true;
    if (selectedCategory === NO_CATEGORY_ID) return taskCategory === NO_CATEGORY_ID;
    return selectedCategory === taskCategory;
}

export const CATEGORY_ICON_COMPONENTS: Record<CategoryIconKey, LucideIcon> = {
    briefcase: Briefcase,
    house: House,
    heart: Heart,
    users: Users,
    paw: PawPrint,
    sparkles: Sparkles,
    book: BookOpen,
    coffee: Coffee,
    dumbbell: Dumbbell,
    flower: Flower2,
    music: Music,
    plane: Plane,
    calendar: CalendarDays,
    cart: ShoppingCart,
    receipt: Receipt,
    wallet: Wallet,
    laptop: Laptop,
    wrench: Wrench,
    smartphone: Smartphone,
    pill: Pill,
    graduation: GraduationCap,
    car: Car,
    clipboard: ClipboardList,
    bell: Bell,
};

export const CATEGORY_ICON_OPTIONS: CategoryIconOption[] = [
    { key: 'briefcase', label: 'Work', Icon: Briefcase },
    { key: 'house', label: 'Home', Icon: House },
    { key: 'heart', label: 'Care', Icon: Heart },
    { key: 'users', label: 'People', Icon: Users },
    { key: 'paw', label: 'Pets', Icon: PawPrint },
    { key: 'sparkles', label: 'Leisure', Icon: Sparkles },
    { key: 'book', label: 'Study', Icon: BookOpen },
    { key: 'coffee', label: 'Break', Icon: Coffee },
    { key: 'dumbbell', label: 'Fitness', Icon: Dumbbell },
    { key: 'flower', label: 'Wellness', Icon: Flower2 },
    { key: 'music', label: 'Music', Icon: Music },
    { key: 'plane', label: 'Travel', Icon: Plane },
    { key: 'calendar', label: 'Schedule', Icon: CalendarDays },
    { key: 'cart', label: 'Shopping', Icon: ShoppingCart },
    { key: 'receipt', label: 'Bills', Icon: Receipt },
    { key: 'wallet', label: 'Finance', Icon: Wallet },
    { key: 'laptop', label: 'Tech', Icon: Laptop },
    { key: 'wrench', label: 'Maintenance', Icon: Wrench },
    { key: 'smartphone', label: 'Calls', Icon: Smartphone },
    { key: 'pill', label: 'Medication', Icon: Pill },
    { key: 'graduation', label: 'Learning', Icon: GraduationCap },
    { key: 'car', label: 'Errands', Icon: Car },
    { key: 'clipboard', label: 'Checklist', Icon: ClipboardList },
    { key: 'bell', label: 'Reminders', Icon: Bell },
];
