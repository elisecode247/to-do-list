import type {
    CategoryIconKey,
    CategoryIconOption,
    CategoryDefinition,
    CategoryOption
} from './types';
export const ALL_CATEGORIES = "all";
export const NO_CATEGORY_ID = "";
import {
    type LucideIcon,
    Briefcase,
    House,
    Heart,
    Users,
    PawPrint,
    Gamepad2,
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


export const CATEGORY_ICON_KEYS = [
    'briefcase',
    'house',
    'heart',
    'users',
    'paw',
    'paw-print',
    'gamepad-2',
    'sparkles',
    'book',
    'coffee',
    'dumbbell',
    'flower',
    'music',
    'plane',
    'calendar',
    'cart',
    'receipt',
    'wallet',
    'laptop',
    'wrench',
    'smartphone',
    'pill',
    'graduation',
    'car',
    'clipboard',
    'bell',
] as const;

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
        name: "Housework",
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
        icon: "paw-print",
        isVisible: true,
        isBuiltIn: true,
    },
    {
        id: "leisure",
        name: "Leisure",
        color: "#34d399",
        icon: "gamepad-2",
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
    'paw-print': PawPrint,
    'gamepad-2': Gamepad2,
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
    { key: 'paw-print', label: 'Pets', Icon: PawPrint },
    { key: 'gamepad-2', label: 'Gaming', Icon: Gamepad2 },
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
