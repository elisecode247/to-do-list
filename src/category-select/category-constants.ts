export const ALL_CATEGORIES = "all";
export const NO_CATEGORY_ID = "";

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
        icon: "Briefcase",
        isVisible: true,
        isBuiltIn: true,
    },
    {
        id: "housework",
        name: "Home",
        color: "#fbbf24",
        icon: "Home",
        isVisible: true,
        isBuiltIn: true,
    },
    {
        id: "self-care",
        name: "Self-Care",
        color: "#f87171",
        icon: "Heart",
        isVisible: true,
        isBuiltIn: true,
    },
    {
        id: "people",
        name: "People",
        color: "#38bdf8",
        icon: "Users",
        isVisible: true,
        isBuiltIn: true,
    },
    {
        id: "pets",
        name: "Pets",
        color: "#a78bfa",
        icon: "PawPrint",
        isVisible: true,
        isBuiltIn: true,
    },
    {
        id: "leisure",
        name: "Leisure",
        color: "#34d399",
        icon: "Sparkles",
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
        icon: sanitizeString(candidate.icon) || undefined,
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
    const prefix = category.icon ? `${category.icon} ` : '';
    const suffix = category.isDeleted ? ' (Removed)' : (!category.isVisible ? ' (Hidden)' : '');
    return `${prefix}${category.name}${suffix}`;
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
